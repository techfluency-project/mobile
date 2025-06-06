import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import Home from "@/src/app/(tabs)/home";

const mockedReplace = jest.fn();
const mockedPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockedReplace,
    push: mockedPush,
  }),
}));

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      API_URL: "https://mockapi.io",
    },
  },
}));

jest.mock("@/src/utils/fetch-with-auth", () => ({
  fetchWithAuth: jest.fn(),
}));

const { fetchWithAuth } = require("@/src/utils/fetch-with-auth");

describe("Home screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar as trilhas e atividades corretamente", async () => {
    fetchWithAuth.mockImplementation((url) => {
      if (url === "/api/LearningPath/GetLearningPath") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: "path1",
                userId: "user1",
                name: "Trilha Frontend",
                description: "Aprenda React",
                level: 1,
                stages: ["stage1", "stage2"],
                dtCreated: "2024-01-01",
              },
            ]),
        });
      }
      if (url.startsWith("/api/PathStage/GetPathStageById?id=stage1")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "stage1",
              isCompleted: true,
            }),
        });
      }
      if (url.startsWith("/api/PathStage/GetPathStageById?id=stage2")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "stage2",
              isCompleted: false,
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const { getByText } = render(<Home />);

    await waitFor(() => {
      expect(getByText("Trilha Frontend")).toBeTruthy();
      expect(getByText("Aprenda React")).toBeTruthy();
    });
  });

  it("não deve renderizar se a API retorna vazio", async () => {
    fetchWithAuth.mockImplementation((url) => {
      if (url === "/api/LearningPath/GetLearningPath") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]), // Lista vazia
        });
      }
      return Promise.resolve({ ok: false });
    });

    const { queryByText } = render(<Home />);

    await waitFor(() => {
      expect(queryByText("Trilha Frontend")).toBeNull();
    });
  });

  it("deve lidar com erro na requisição", async () => {
    fetchWithAuth.mockImplementation(() =>
      Promise.reject(new Error("API Error"))
    );

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    render(<Home />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
