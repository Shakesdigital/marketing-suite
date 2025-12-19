'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { supabase } from '@/lib/supabase/client'
import { Company, ContentPost } from '@/types'
import { getContentPosts } from '@/lib/actions/content-actions'
import { Button } from '@/components/ui/button'
import { Sparkles, Edit, Trash2, Calendar, CheckCircle, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function ContentPostsPage() {
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null)

  useEffect(() => {
    loadData()
  }, [companyId])

  const loadData = async () => {
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      setCompany(companyData as Company)

      const postsData = await getContentPosts(companyId)
      setPosts(postsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Make data readable by Copilot
  useCopilotReadable({
    description: 'All content posts for the company',
    value: posts,
  })

  // Action: Generate single post
  useCopilotAction({
    name: 'generateSinglePost',
    description: 'Generate a single social media post with custom specifications',
    parameters: [
      {
        name: 'platform',
        type: 'string',
        description: 'Social media platform (instagram, facebook, linkedin, twitter, tiktok)',
        required: true,
      },
      {
        name: 'topic',
        type: 'string',
        description: 'Topic or theme for the post',
        required: true,
      },
      {
        name: 'contentType',
        type: 'string',
        description: 'Type of content (educational, promotional, engagement, story)',
        required: false,
      },
      {
        name: 'tone',
        type: 'string',
        description: 'Tone of voice (use company brand voice or specify)',
        required: false,
      },
    ],
    handler: async ({ platform, topic, contentType, tone }) => {
      if (!company) return 'Company not found.'

      try {
        const caption = generateCustomCaption(company, platform, topic, contentType, tone)
        const hashtags = generateCustomHashtags(platform, topic)

        const { data, error } = await supabase
          .from('content_posts')
          .insert({
            company_id: company.id,
            platform,
            caption,
            hashtags,
            media_type: platform === 'instagram' || platform === 'tiktok' ? 'image' : 'text',
            status: 'draft',
            generated_by_ai: true,
            generation_prompt: `Topic: ${topic}, Type: ${contentType || 'general'}`,
          })
          .select()
          .single()

        if (error) throw error

        setPosts([data as ContentPost, ...posts])

        return `✅ Post generated successfully for ${platform}!

Topic: ${topic}
Type: ${contentType || 'General'}

The post is saved as a draft. You can review and edit it before scheduling.`
      } catch (error) {
        return 'Failed to generate post. Please try again.'
      }
    },
  })

  // Action: Edit post caption
  useCopilotAction({
    name: 'editPostCaption',
    description: 'Edit the caption of an existing post',
    parameters: [
      {
        name: 'postId',
        type: 'string',
        description: 'ID of the post to edit',
        required: true,
      },
      {
        name: 'newCaption',
        type: 'string',
        description: 'New caption text',
        required: true,
      },
    ],
    handler: async ({ postId, newCaption }) => {
      try {
        const { error } = await supabase
          .from('content_posts')
          .update({ caption: newCaption })
          .eq('id', postId)

        if (error) throw error

        // Update local state
        setPosts(posts.map((p) => (p.id === postId ? { ...p, caption: newCaption } : p)))

        return '✅ Post caption updated successfully!'
      } catch (error) {
        return 'Failed to update post. Please try again.'
      }
    },
  })

  // Action: Schedule post
  useCopilotAction({
    name: 'schedulePost',
    description: 'Schedule a post for publishing at a specific date and time',
    parameters: [
      {
        name: 'postId',
        type: 'string',
        description: 'ID of the post to schedule',
        required: true,
      },
      {
        name: 'scheduledDate',
        type: 'string',
        description: 'Date and time to publish (ISO format)',
        required: true,
      },
    ],
    handler: async ({ postId, scheduledDate }) => {
      try {
        const { error } = await supabase
          .from('content_posts')
          .update({
            scheduled_date: scheduledDate,
            status: 'scheduled',
          })
          .eq('id', postId)

        if (error) throw error

        setPosts(
          posts.map((p) =>
            p.id === postId ? { ...p, scheduled_date: scheduledDate, status: 'scheduled' } : p
          )
        )

        return `✅ Post scheduled for ${new Date(scheduledDate).toLocaleString()}!`
      } catch (error) {
        return 'Failed to schedule post. Please try again.'
      }
    },
  })

  // Action: Delete post
  useCopilotAction({
    name: 'deletePost',
    description: 'Delete a content post',
    parameters: [
      {
        name: 'postId',
        type: 'string',
        description: 'ID of the post to delete',
        required: true,
      },
    ],
    handler: async ({ postId }) => {
      try {
        const { error } = await supabase.from('content_posts').delete().eq('id', postId)

        if (error) throw error

        setPosts(posts.filter((p) => p.id !== postId))

        return '✅ Post deleted successfully!'
      } catch (error) {
        return 'Failed to delete post. Please try again.'
      }
    },
  })

  const filteredPosts = selectedStatus === 'all' 
    ? posts 
    : posts.filter((p) => p.status === selectedStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Posts</h1>
            <p className="mt-2 text-gray-600">Manage your social media content</p>
          </div>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate New Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['all', 'draft', 'scheduled', 'published'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
          <p className="mt-2 text-gray-600">
            Ask the AI assistant to generate social media posts
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Try: "Generate an Instagram post about our latest product"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onSelect={setSelectedPost} />
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({ post, onSelect }: { post: ContentPost; onSelect: (post: ContentPost) => void }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  const platformColors = {
    instagram: 'bg-pink-100 text-pink-800',
    facebook: 'bg-blue-100 text-blue-800',
    linkedin: 'bg-indigo-100 text-indigo-800',
    twitter: 'bg-sky-100 text-sky-800',
    tiktok: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                platformColors[post.platform as keyof typeof platformColors]
              }`}
            >
              {post.platform}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusColors[post.status as keyof typeof statusColors]
              }`}
            >
              {post.status}
            </span>
            {post.generated_by_ai && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </span>
            )}
          </div>

          <p className="mt-3 whitespace-pre-wrap text-gray-700">{post.caption}</p>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="text-sm text-blue-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.scheduled_date && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Scheduled for {formatDateTime(post.scheduled_date)}</span>
            </div>
          )}

          {post.published_date && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Published on {formatDateTime(post.published_date)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function generateCustomCaption(
  company: Company,
  platform: string,
  topic: string,
  contentType?: string,
  tone?: string
): string {
  const brandVoice = tone || company.brand_voice || 'professional and friendly'

  let caption = `${topic}\n\n`

  if (contentType === 'educational') {
    caption += `Here's what you need to know about this topic...\n\n`
    caption += `💡 Key takeaway: [Your insight here]\n\n`
  } else if (contentType === 'promotional') {
    caption += `We're excited to share this with you! ✨\n\n`
    caption += `[Benefits and features]\n\n`
  } else if (contentType === 'engagement') {
    caption += `We want to hear from you! 💬\n\n`
    caption += `What's your experience with this?\n\n`
  } else {
    caption += `Let's talk about this interesting topic...\n\n`
  }

  if (platform === 'linkedin') {
    caption += `\n\nWhat are your thoughts? Share in the comments! 👇`
  } else if (platform === 'instagram') {
    caption += `\n\n💾 Save this for later!\n👉 Share with someone who needs this!`
  } else {
    caption += `\n\nLet us know what you think! 💬`
  }

  return caption
}

function generateCustomHashtags(platform: string, topic: string): string[] {
  const topicWords = topic.toLowerCase().split(' ')
  const baseHashtags = topicWords.filter((w) => w.length > 3).slice(0, 3)

  if (platform === 'instagram') {
    return [...baseHashtags, 'instagood', 'socialmedia', 'marketing', 'business', 'entrepreneur']
  } else if (platform === 'linkedin') {
    return [...baseHashtags, 'business', 'professional', 'leadership']
  } else if (platform === 'tiktok') {
    return [...baseHashtags, 'fyp', 'viral', 'trending']
  }

  return baseHashtags
}
