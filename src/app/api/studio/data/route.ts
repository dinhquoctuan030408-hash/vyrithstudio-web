import { NextResponse } from 'next/server';
import { redis } from '@/lib/db';
import { STUDIO_CONFIG, UpcomingProject, AppItem, FeedbackThread } from '@/data/config';

export const dynamic = 'force-dynamic';

const KEY_PROJECTS = 'vyrith_cloud_projects';
const KEY_APPS = 'vyrith_cloud_apps';
const KEY_FEEDBACKS = 'vyrith_cloud_feedbacks';

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
        isCloudConnected: true,
        projects: (cloudProjects as UpcomingProject[]) || null,
        apps: (cloudApps as AppItem[]) || null,
        feedbacks: (cloudFeedbacks as FeedbackThread[]) || null,
      });
    }

    return NextResponse.json({
      success: true,
      isCloudConnected: false,
      projects: null,
      apps: null,
      feedbacks: null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (redis) {
      if (type === 'projects') await redis.set(KEY_PROJECTS, data);
      if (type === 'apps') await redis.set(KEY_APPS, data);
      if (type === 'feedbacks') await redis.set(KEY_FEEDBACKS, data);
      return NextResponse.json({ success: true, cloudSaved: true });
    }

    return NextResponse.json({ success: true, cloudSaved: false });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}