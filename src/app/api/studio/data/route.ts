import { NextResponse } from 'next/server';
import { redis } from '@/lib/db';
import { STUDIO_CONFIG, UpcomingProject, AppItem, FeedbackThread } from '@/data/config';

export const dynamic = 'force-dynamic';

const KEY_PROJECTS = 'vyrith_cloud_projects_v2';
const KEY_APPS = 'vyrith_cloud_apps_v2';
const KEY_FEEDBACKS = 'vyrith_cloud_feedbacks_v2';
const KEY_META_TIMESTAMPS = 'vyrith_meta_timestamps';

export async function GET() {
  try {
    if (redis) {
      const [cloudProjects, cloudApps, cloudFeedbacks, metaTimestamps] = await Promise.all([
        redis.get(KEY_PROJECTS),
        redis.get(KEY_APPS),
        redis.get(KEY_FEEDBACKS),
        redis.get(KEY_META_TIMESTAMPS),
      ]);

      return NextResponse.json({
        success: true,
        isCloudConnected: true,
        projects: (cloudProjects as UpcomingProject[]) || null,
        apps: (cloudApps as AppItem[]) || null,
        feedbacks: (cloudFeedbacks as FeedbackThread[]) || null,
        timestamps: metaTimestamps || {},
      });
    }

    return NextResponse.json({
      success: true,
      isCloudConnected: false,
      projects: null,
      apps: null,
      feedbacks: null,
      timestamps: {},
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, timestamp } = body;
    const now = timestamp || Date.now();

    if (redis) {
      const metaTimestamps: any = (await redis.get(KEY_META_TIMESTAMPS)) || {};

      if (type === 'projects') {
        await redis.set(KEY_PROJECTS, data);
        metaTimestamps.projects = now;
      } else if (type === 'apps') {
        await redis.set(KEY_APPS, data);
        metaTimestamps.apps = now;
      } else if (type === 'feedbacks') {
        await redis.set(KEY_FEEDBACKS, data);
        metaTimestamps.feedbacks = now;
      }

      await redis.set(KEY_META_TIMESTAMPS, metaTimestamps);
      return NextResponse.json({ success: true, cloudSaved: true, timestamp: now });
    }

    return NextResponse.json({ success: true, cloudSaved: false, timestamp: now });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}