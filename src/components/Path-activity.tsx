import { useRouter } from "expo-router";
import { Check, Lock, Sparkle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../styles/colors";
import { fetchWithAuth } from "../utils/fetch-with-auth";

type Props = {
  id: string;
  isActive: boolean;
  isDisabled?: boolean;
  isCompleted?: boolean;
  onSelect: (id: string) => void;
};

interface ActivityData {
  id: string;
  name: string;
  isCompleted: boolean;
}

export default function PathActivity({
  id,
  isActive,
  isDisabled = false,
  isCompleted = false,
  onSelect,
}: Props) {
  const router = useRouter();
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [tooltipX, setTooltipX] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  const circleScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchWithAuth(`/api/PathStage/GetPathStageById?id=${id}`)
      .then((res) => res.json())
      .then((data: ActivityData) => setActivityData(data))
      .catch(console.error);

    if (!isDisabled && !isCompleted) {
      onSelect(id);
    }
  }, []);

  useEffect(() => {
    if (isActive && !isDisabled) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: -60,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(circleScaleAnim, {
          toValue: 1.2,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(circleScaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, isDisabled]);

  const splitCamelCase = (str: string) => str.replace(/([A-Z])/g, " $1").trim();

  const baseColor = isDisabled
    ? colors.inputBorder
    : isCompleted
    ? "#F59E0B"
    : colors.primary;

  const icon = isDisabled ? (
    <Lock size={32} color="white" />
  ) : isCompleted ? (
    <Check size={32} color="white" />
  ) : (
    <Sparkle size={32} color="white" />
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    setTooltipX(e.nativeEvent.layout.x);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={{
          transform: [{ translateX: moveAnim }, { scale: circleScaleAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => !isDisabled && onSelect(id)}
          onLayout={handleLayout}
          activeOpacity={0.7}
          style={[
            styles.circle,
            { backgroundColor: baseColor },
            isDisabled && styles.disabledCircle,
          ]}
        >
          {icon}
        </TouchableOpacity>
      </Animated.View>

      {isActive && !isDisabled && activityData && (
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.tooltip, { borderLeftColor: baseColor }]}>
            <Text style={styles.tooltipTitle}>
              {splitCamelCase(activityData.name)}
            </Text>
            <TouchableOpacity
              style={styles.tooltipButton}
              onPress={() => {
                router.push(`/activity/${id}`);
              }}
            >
              <Text style={styles.tooltipButtonText}>
                {activityData.isCompleted ? "Review" : "Start"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledCircle: {
    opacity: 0.5,
  },
  tooltipContainer: {
    position: "absolute",
    left: 80,
  },
  tooltip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 12,
    marginVertical: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: 160,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: colors.textPrimary,
  },
  tooltipButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    width: "100%",
  },
  tooltipButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
