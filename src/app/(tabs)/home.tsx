// src/app/(tabs)/home.tsx
import PathActivity from '@/src/components/Path-activity';
import { colors } from '@/src/styles/colors';
import { fetchWithAuth } from '@/src/utils/fetch-with-auth';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type ActivityData = { id: string; isCompleted: boolean };
type LearningPath = {
  id: string;
  userId: string;
  name: string;
  description: string;
  level: number;
  stages: string[];
  dtCreated: string;
};
type PathWithActivities = {
  path: LearningPath;
  activities: ActivityData[];
};

export default function Home() {
  const router = useRouter();
  const [pathsList, setPathsList] = useState<PathWithActivities[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  console.log(
    Constants)

  const fetchLearningPaths = async () => {
    try {
      const response = await fetchWithAuth('/api/LearningPath/GetLearningPath');
      if (!response.ok) throw new Error('Network response was not ok');

      const paths: LearningPath[] = await response.json();
      if (!paths.length) {
        // router.push('/activity');
        return;
      }

      const list = await Promise.all(
        paths.map(async (path) => {
          const activities = await Promise.all(
            path.stages.map(async (stageId) => {
              const res = await fetchWithAuth(
                `/api/PathStage/GetPathStageById?id=${stageId}`
              );
              if (!res.ok) return { id: stageId, isCompleted: false };

              const data = await res.json();
              return { id: data.id, isCompleted: data.isCompleted };
            })
          );
          return { path, activities };
        })
      );

      setPathsList(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  // initial active = first activity of the *last* path:
  useEffect(() => {
    if (!activeId && pathsList.length) {
      const reversedPaths = pathsList.slice().reverse();
      const firstActivities = reversedPaths[0].activities;
      if (firstActivities.length) {
        setActiveId(firstActivities[0].id);
      }
    }
  }, [pathsList, activeId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {pathsList
          .slice()
          .reverse()
          .map(({ path, activities }) => (
            <View key={path.id} style={styles.pathSection}>
              <View style={styles.activitiesVertical}>
                {activities
                  .slice()
                  .reverse()
                  .map((activity, idx, arr) => {
                    const previousCompleted =
                      idx === 0 || arr[idx - 1].isCompleted;

                    return (
                      <PathActivity
                        key={activity.id}
                        id={activity.id}
                        isActive={activeId === activity.id}
                        isDisabled={!previousCompleted}
                        isCompleted={activity.isCompleted}
                        onSelect={setActiveId}
                      />
                    );
                  })}
              </View>
              <View style={styles.pathInfo}>
                <Text style={styles.pathTitle}>{path.name}</Text>
                <Text style={styles.pathDescription}>{path.description}</Text>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  pathSection: {
    alignItems: 'center',
  },
  pathInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: 300,
    height: 120,
  },
  pathTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.primary,
  },
  pathDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  activitiesVertical: {
    flex: 1,
    flexDirection: 'column-reverse',
    rowGap: 24,
  },
});
