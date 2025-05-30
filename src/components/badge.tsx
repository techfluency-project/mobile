import { Medal } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface BadgeProps {
  id: string;
  progress: number; // from 0 to goal (you’ll calculate percentage)
}

interface BadgeData {
  id: string;
  title: string;
  description: string;
  icon: string;
  goal: number;
  topic: number;
}

export default function Badge({ id, progress }: BadgeProps) {
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const token = ""; // You should replace this with your token retrieval logic

        const res = await fetch(`http://localhost:5092/api/Badge/GetBadgeById?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch badge");
        }

        const data: BadgeData = await res.json();
        setBadge(data);
      } catch (err) {
        console.error("Error fetching badge:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadge();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading badge...</Text>
      </View>
    );
  }

  if (!badge) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load badge.</Text>
      </View>
    );
  }

  const progressPercent = badge.goal > 0 ? Math.min((progress / badge.goal) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Medal size={40} color="#2563eb" />
      </View>
      <View style={styles.infoContainer}>
        <Text 
          numberOfLines={1} 
          ellipsizeMode="tail" 
          style={styles.title}
        >{badge.title}</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text 
          numberOfLines={1} 
          ellipsizeMode="tail" 
          style={styles.description}
        >{badge.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    padding: 16,
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#f3f4f6", // Tailwind gray-100
    padding: 16,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-around",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827", // Tailwind gray-900
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#f3f4f6", // Tailwind gray-100
    borderRadius: 9999,
    marginVertical: 8,
    overflow: "hidden",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563eb", // Tailwind blue-700
    borderRadius: 9999,
  },
  description: {
    color: "#374151", // Tailwind gray-700
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#9ca3af", // Tailwind gray-400
    fontStyle: "italic",
  },
  errorContainer: {
    padding: 8,
  },
  errorText: {
    color: "red",
  },
});
