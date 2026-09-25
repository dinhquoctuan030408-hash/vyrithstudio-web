import { NextResponse } from 'next/server';
import { redis } from '@/lib/db';
import { STUDIO_CONFIG, UpcomingProject, AppItem, FeedbackThread } from '@/data/config';

export const dynamic = 'force-dynamic';

const KEY_PROJECTS = 'vyrith_cloud_projects';
const KEY_APPS = 'vyrith_cloud_apps';
const KEY_FEEDBACKS = 'vyrith_cloud_feedbacks';

// GET: Lấy toàn bộ dữ liệu mới nhất từ Cloud Database
export async function GET() {
  try {
    if (redis) {
      const [cloudProjects, cloudApps, cloudFeedbacks] = await Promise.all([
        redis.get(KEY_PROJECTS),
        redis.get(KEY_APPS),
        redis.get(KEY_FEEDBACKS),
      ]);

      return NextResponse.json({
        success: true,
        projects: (cloudProjects as UpcomingProject[]) || STUDIO_CONFIG.upcomingProjects,
        apps: (cloudApps as AppItem[]) || STUDIO_CONFIG.activeApps,
        feedbacks: (cloudFeedbacks as FeedbackThread[]) || [],
      });
    }

    // Fallback nếu chưa kết nối Redis
    return NextResponse.json({
      success: true,
      projects: STUDIO_CONFIG.upcomingProjects,
      apps: STUDIO_CONFIG.activeApps,
      feedbacks: [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Cập nhật & đồng bộ tức thì lên Cloud khi Founder chỉnh sửa trên Panel
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!redis) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cloud database is not connected. Data will only be stored locally.' 
      }, { status: 500 });
    }

    if (type === 'projects') {
      await redis.set(KEY_PROJECTS, data);
    } else if (type === 'apps') {
      await redis.set(KEY_APPS, data);
    } else if (type === 'feedbacks') {
      await redis.set(KEY_FEEDBACKS, data);
    }

    return NextResponse.json({ success: true, message: `Successfully synchronized ${type} across all devices.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}