import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Login from "../components/Login";
import * as tokenService from "../services/token-service";
import { Alert } from "react-native";

// Mock do useRouter do expo-router
const mockedReplace = jest.fn();
const mockedPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockedReplace,
    push: mockedPush,
  }),
}));

// Mock do Alert
jest.spyOn(Alert, "alert");

// Mock do fetch global
global.fetch = jest.fn();

// Mock do token-service
jest.mock("../services/token-service");

describe("Login Component", () => {
  const mockedRouter = require("expo-router").useRouter();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar os inputs e botão", () => {
    const { getByPlaceholderText, getByText } = render(<Login />);
    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Login")).toBeTruthy();
  });

  it("deve permitir digitar username e password", () => {
    const { getByPlaceholderText } = render(<Login />);
    const usernameInput = getByPlaceholderText("Username");
    const passwordInput = getByPlaceholderText("Password");

    fireEvent.changeText(usernameInput, "meuUsuario");
    fireEvent.changeText(passwordInput, "minhaSenha");

    expect(usernameInput.props.value).toBe("meuUsuario");
    expect(passwordInput.props.value).toBe("minhaSenha");
  });

  it("deve redirecionar para /home se token existir no useEffect", async () => {
    tokenService.getToken.mockResolvedValue("token_existente");

    render(<Login />);

    await waitFor(() => {
      expect(mockedRouter.replace).toHaveBeenCalledWith("/home");
    });
  });

  it("deve realizar login com sucesso e salvar token", async () => {
    tokenService.getToken.mockResolvedValue(null);
    const fakeToken = "fake_jwt_token";

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ acessToken: fakeToken }),
    });

    tokenService.saveToken.mockResolvedValue();

    const { getByPlaceholderText, getByText } = render(<Login />);

    fireEvent.changeText(getByPlaceholderText("Username"), "user");
    fireEvent.changeText(getByPlaceholderText("Password"), "pass");

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/User/sign-in"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "user", password: "pass" }),
        })
      );
    });

    await waitFor(() => {
      expect(tokenService.saveToken).toHaveBeenCalledWith(fakeToken);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Logged in successfully"
      );
      expect(mockedRouter.replace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });

  it("deve mostrar alerta de erro quando login falhar", async () => {
    tokenService.getToken.mockResolvedValue(null);

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    const { getByPlaceholderText, getByText } = render(<Login />);

    fireEvent.changeText(getByPlaceholderText("Username"), "user");
    fireEvent.changeText(getByPlaceholderText("Password"), "wrongpass");

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Invalid credentials");
    });
  });

  it("deve mostrar alerta de erro quando token não estiver na resposta", async () => {
    tokenService.getToken.mockResolvedValue(null);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // sem token
    });

    const { getByPlaceholderText, getByText } = render(<Login />);

    fireEvent.changeText(getByPlaceholderText("Username"), "user");
    fireEvent.changeText(getByPlaceholderText("Password"), "pass");

    fireEvent.press(getByText("Login"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Token not found in response"
      );
    });
  });
});
