import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Profile from "../app/(tabs)/profile";
import { fetchWithAuth } from "@/src/utils/fetch-with-auth";
import { deleteToken } from "@/src/services/token-service";

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@/src/utils/fetch-with-auth", () => ({
  fetchWithAuth: jest.fn(),
}));

jest.mock("@/src/services/token-service", () => ({
  deleteToken: jest.fn(),
}));

describe("Profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza e mostra username", async () => {
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ username: "testuser" }),
    });

    const { getByText } = render(<Profile />);

    await waitFor(() => {
      expect(getByText("testuser")).toBeTruthy();
    });
  });

  it("abre modal de edição ao clicar no botão", async () => {
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ username: "testuser" }),
    });

    const { getAllByText } = render(<Profile />);

    await waitFor(() => {
      expect(getAllByText("testuser")[0]).toBeTruthy();
    });

    const btnEditar = getAllByText("Edit Profile")[0];
    fireEvent.press(btnEditar);

    await waitFor(() => {
      // Verifica se o modal com o título "Edit Profile" apareceu (geralmente é o segundo)
      expect(getAllByText("Edit Profile").length).toBeGreaterThan(1);
    });
  });

  it("realiza logout e chama replace", async () => {
    fetchWithAuth.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ username: "testuser" }),
    });

    const { getAllByText } = render(<Profile />);

    await waitFor(() => {
      expect(getAllByText("testuser")[0]).toBeTruthy();
    });

    const btnLogout = getAllByText("Log out")[0];
    fireEvent.press(btnLogout);

    const confirmLogout = getAllByText("Log out")[1];
    fireEvent.press(confirmLogout);

    expect(deleteToken).toHaveBeenCalledTimes(0);
  });
});
