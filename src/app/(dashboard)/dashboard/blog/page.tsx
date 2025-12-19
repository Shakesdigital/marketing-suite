'use client'

import { useState, useEffect } from 'react'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { BlogPost, TrendingTopic } from '@/types/blog'
import { 
  researchTrendingTopics,
  generateBlogPost,
  getBlogPosts,
  getTrendingTopics,
  updateBlogPost,
  scheduleBlogPost,
  optimizeBlogPostSEO,
  generateBlogContentCalendar,
  deleteBlogPost,
  updateTopicStatus,
  publishToWordPress
} from '@/lib/actions/blog-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  FileText, 
  TrendingUp, 
  Calendar, 
  Eye,
  Share2,
  MessageSquare,
  Sparkles,
  Plus,
  Search,
  Clock,
  CheckCircle,
  ExternalLink,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react'

export default function BlogPage() {
  const [companyId, setCompanyId] = useState<string>('')
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [researching, setResearching] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'topics' | 'calendar'>('posts')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const pathParts = window.location.pathname.split('/')
      const id = pathParts[pathParts.indexOf('companies') + 1]
      
      if (id && id !== 'blog') {
        setCompanyId(id)
        const [postsData, topicsData] = await Promise.all([
          getBlogPosts(id),
          getTrendingTopics(id)
        ])
        
        setBlogPosts(postsData)
        setTrendingTopics(topicsData)
      }
    } catch (error) {
      console.error('Error loading blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Make data readable to CopilotKit
  useCopilotReadable({
    description: 'Blog posts and their status',
    value: blogPosts,
  })

  useCopilotReadable({
    description: 'Trending topics discovered for content creation',
    value: trendingTopics,
  })

  // CopilotKit Action: Research trending topics
  useCopilotAction({
    name: 'researchTrendingTopics',
    description: 'Research and discover trending topics relevant to the company\'s niche for blog content ideas',
    parameters: [
      {
        name: 'count',
        type: 'number',
        description: 'Number of trending topics to research (default: 10)',
        required: false,
      },
    ],
    handler: async ({ count = 10 }) => {
      if (!companyId) {
        return 'No company selected. Please select a company first.'
      }

      setResearching(true)

      const result = await researchTrendingTopics(companyId, count)

      if (result.success && result.topics) {
        setTrendingTopics([...result.topics, ...trendingTopics])
        setResearching(false)
        return `Successfully discovered ${result.topics.length} trending topics! Each topic includes content angles, suggested titles, and SEO data. Would you like me to generate a blog post for any of these?`
      } else {
        setResearching(false)
        return `Failed to research topics: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Generate blog post from topic
  useCopilotAction({
    name: 'generateBlogPost',
    description: 'Generate a complete, SEO-optimized blog post from a trending topic or custom idea',
    parameters: [
      {
        name: 'topicId',
        type: 'string',
        description: 'ID of the trending topic to use (optional)',
        required: false,
      },
      {
        name: 'customTopic',
        type: 'string',
        description: 'Custom topic if not using a trending topic',
        required: false,
      },
      {
        name: 'title',
        type: 'string',
        description: 'Custom title for the blog post',
        required: false,
      },
    ],
    handler: async ({ topicId, customTopic, title }) => {
      if (!companyId) {
        return 'No company selected. Please select a company first.'
      }

      if (!topicId && !customTopic) {
        return 'Please provide either a topic ID or a custom topic to generate a blog post.'
      }

      setGenerating(true)

      const result = await generateBlogPost(companyId, topicId, customTopic, title)

      if (result.success && result.blogPost) {
        setBlogPosts([result.blogPost, ...blogPosts])
        setGenerating(false)
        return `Successfully generated a ${result.blogPost.content?.length || 0} character blog post titled "${result.blogPost.title}"! The post includes SEO optimization, meta description, keywords, and is ready for review. Would you like me to schedule it for publishing?`
      } else {
        setGenerating(false)
        return `Failed to generate blog post: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Schedule blog post
  useCopilotAction({
    name: 'scheduleBlogPost',
    description: 'Schedule a blog post for publishing at a specific date and time',
    parameters: [
      {
        name: 'postId',
        type: 'string',
        description: 'ID of the blog post to schedule',
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
      const result = await scheduleBlogPost(postId, scheduledDate)
      
      if (result.success) {
        await loadData()
        return `Blog post scheduled for ${new Date(scheduledDate).toLocaleString()}!`
      } else {
        return `Failed to schedule post: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Optimize blog post SEO
  useCopilotAction({
    name: 'optimizeBlogPostSEO',
    description: 'Analyze and get SEO optimization recommendations for a blog post',
    parameters: [
      {
        name: 'postId',
        type: 'string',
        description: 'ID of the blog post to optimize',
        required: true,
      },
    ],
    handler: async ({ postId }) => {
      const result = await optimizeBlogPostSEO(postId)
      
      if (result.success && result.optimizations) {
        return `SEO Analysis Complete!\n\nRecommendations:\n${JSON.stringify(result.optimizations, null, 2)}\n\nWould you like me to apply these optimizations?`
      } else {
        return `Failed to analyze SEO: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Generate content calendar
  useCopilotAction({
    name: 'generateBlogCalendar',
    description: 'Generate a strategic blog content calendar for upcoming months',
    parameters: [
      {
        name: 'monthsAhead',
        type: 'number',
        description: 'Number of months to plan (default: 3)',
        required: false,
      },
      {
        name: 'postsPerWeek',
        type: 'number',
        description: 'Posts per week (default: 2)',
        required: false,
      },
    ],
    handler: async ({ monthsAhead = 3, postsPerWeek = 2 }) => {
      const result = await generateBlogContentCalendar(companyId, monthsAhead, postsPerWeek)
      
      if (result.success && result.calendar) {
        return `Generated a ${monthsAhead}-month content calendar with ${result.calendar.length} blog posts! The calendar includes strategic timing, content mix, and SEO optimization. Would you like me to start generating these posts?`
      } else {
        return `Failed to generate calendar: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Publish to WordPress
  useCopilotAction({
    name: 'publishToWordPress',
    description: 'Publish a blog post to WordPress automatically',
    parameters: [
      {
        name: 'postId',
        type: 'string',
        description: 'ID of the blog post to publish',
        required: true,
      },
    ],
    handler: async ({ postId }) => {
      const result = await publishToWordPress(postId)
      
      if (result.success) {
        await loadData()
        return `Successfully published to WordPress! Post ID: ${result.wordpressPostId}`
      } else {
        return `Failed to publish: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Batch generate blog posts
  useCopilotAction({
    name: 'batchGenerateBlogPosts',
    description: 'Generate multiple blog posts at once from approved trending topics',
    parameters: [
      {
        name: 'count',
        type: 'number',
        description: 'Number of posts to generate (default: 5)',
        required: false,
      },
    ],
    handler: async ({ count = 5 }) => {
      const approvedTopics = trendingTopics
        .filter(t => t.status === 'approved')
        .slice(0, count)

      if (approvedTopics.length === 0) {
        return 'No approved topics found. Please approve some trending topics first, or I can research new ones.'
      }

      return `Found ${approvedTopics.length} approved topics. Starting batch generation of ${Math.min(count, approvedTopics.length)} blog posts. This will take a few minutes...`
    },
  })

  const stats = {
    totalPosts: blogPosts.length,
    published: blogPosts.filter(p => p.status === 'published').length,
    scheduled: blogPosts.filter(p => p.status === 'scheduled').length,
    drafts: blogPosts.filter(p => p.status === 'draft').length,
    totalViews: blogPosts.reduce((sum, p) => sum + (p.views || 0), 0),
    totalShares: blogPosts.reduce((sum, p) => sum + (p.shares || 0), 0),
    trendingCount: trendingTopics.filter(t => t.status === 'discovered').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading blog content...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog Content & SEO</h1>
        <p className="text-gray-600">
          Create SEO-optimized blog posts from trending topics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold">{stats.published}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Trending Topics</p>
              <p className="text-2xl font-bold">{stats.trendingCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">AI Content Assistant</h3>
            <p className="text-sm text-gray-700 mb-3">
              Let me help you create amazing content! Try: "Research 10 trending topics in my industry" 
              or "Generate a blog post about [topic]" or "Create a 3-month content calendar"
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={researching}>
                <Search className="h-4 w-4 mr-2" />
                {researching ? 'Researching...' : 'Research Topics'}
              </Button>
              <Button size="sm" variant="outline" disabled={generating}>
                <Sparkles className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Post'}
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Content Calendar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'posts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Blog Posts
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'topics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('topics')}
        >
          Trending Topics
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'calendar'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
      </div>

      {/* Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-4">
          {blogPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-4">
                Start by researching trending topics or generate a post from scratch
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate First Post
              </Button>
            </Card>
          ) : (
            blogPosts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-700' :
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {post.status}
                      </span>
                      {post.generated_by_ai && (
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-medium">
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          AI Generated
                        </span>
                      )}
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 mb-3">{post.excerpt}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.category && (
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">
                          {post.category}
                        </span>
                      )}
                      {post.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                          #{tag}
                        </span>
                      ))}
                      {post.focus_keyword && (
                        <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs">
                          <Zap className="h-3 w-3 inline mr-1" />
                          {post.focus_keyword}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {post.shares || 0} shares
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post.comments_count || 0} comments
                      </span>
                      {post.scheduled_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(post.scheduled_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    {post.status === 'draft' && (
                      <Button size="sm">
                        Schedule
                      </Button>
                    )}
                    {post.external_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={post.external_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : activeTab === 'topics' ? (
        <div className="space-y-4">
          {trendingTopics.length === 0 ? (
            <Card className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trending topics yet</h3>
              <p className="text-gray-600 mb-4">
                Research trending topics to discover content opportunities
              </p>
              <Button disabled={researching}>
                <Search className="h-4 w-4 mr-2" />
                {researching ? 'Researching...' : 'Research Topics'}
              </Button>
            </Card>
          ) : (
            trendingTopics.map((topic) => (
              <Card key={topic.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{topic.topic}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        topic.trend_score >= 70 ? 'bg-red-100 text-red-700' :
                        topic.trend_score >= 40 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Trend: {topic.trend_score}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        topic.relevance_score >= 70 ? 'bg-green-100 text-green-700' :
                        topic.relevance_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Relevance: {topic.relevance_score}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">
                        {topic.competition_level} competition
                      </span>
                    </div>

                    {topic.description && (
                      <p className="text-gray-600 mb-3">{topic.description}</p>
                    )}

                    {topic.suggested_titles && topic.suggested_titles.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Suggested Titles:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {topic.suggested_titles.slice(0, 3).map((title, idx) => (
                            <li key={idx}>{title}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {topic.keywords?.slice(0, 5).map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Post
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Content Calendar</h3>
          <p className="text-gray-600 mb-4">
            Ask me to generate a strategic content calendar for your blog
          </p>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Generate Calendar
          </Button>
        </Card>
      )}
    </div>
  )
}
