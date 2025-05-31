import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Activity from "../app/(tabs)/activity/index";
import { fetchWithAuth } from "@/src/utils/fetch-with-auth";

// Mocks
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("@/src/utils/fetch-with-auth", () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock("@/src/components/activity/question", () => "Question");

import { useLocalSearchParams } from "expo-router";

describe("Activity component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("mostra a mensagem de loading ao iniciar", async () => {
    useLocalSearchParams.mockReturnValue({ activityId: "123" });

    fetchWithAuth
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ questions: ["q1", "q2"] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "q1", correctAnswer: "A" }),
      });

    const { getByText } = render(<Activity mode="single" activityId="123" />);
    expect(getByText("Loading…")).toBeTruthy();
  });

  it("redireciona para /home se já tiver learning path no modo placement", async () => {
    useLocalSearchParams.mockReturnValue({});
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ pathId: "abc" }],
    });

    render(<Activity mode="placement" />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/home");
    });
  });

  it("exibe o modal de boas-vindas no modo placement se não houver learning path", async () => {
    useLocalSearchParams.mockReturnValue({});
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { getByText } = render(<Activity mode="placement" />);
    expect(getByText("Welcome to your English journey!")).toBeTruthy();
  });

  it('fecha o modal ao clicar em "Yes, take the test"', async () => {
    useLocalSearchParams.mockReturnValue({});
    fetchWithAuth.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByText, queryByText } = render(<Activity mode="placement" />);
    fireEvent.press(getByText("Yes, take the test"));

    await waitFor(() => {
      expect(queryByText("Welcome to your English journey!")).toBeNull();
    });
  });

  it("mostra o resultado final ao concluir o teste placement", async () => {
    useLocalSearchParams.mockReturnValue({});
    fetchWithAuth
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "q1", correctAnswer: "A" }],
      }) // questões
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ level: { result: "Intermediate" } }),
      }) // resultado
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Path set" }),
      }); // learning path

    const { getByText } = render(<Activity mode="placement" />);

    await waitFor(() => {
      expect(fetchWithAuth).toHaveBeenCalledTimes(1);
    });
  });
});
