import { MetadataRoute } from 'next'
import { DATA } from '@/data/resume'
import { BlogService } from '@/services/blog-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all published blogs
  let blogs: any[] = [];
  try {
    blogs = await BlogService.getAll({ isPublished: true });
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  // Create sitemap entries for blog posts
  const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${DATA.url}/blog/${blog.slug}`,
    lastModified: new Date(blog.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: DATA.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${DATA.url}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogEntries,
  ]
}
