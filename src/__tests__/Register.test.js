import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Register from "../components/Register";

const mockedReplace = jest.fn();
const mockedPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockedReplace,
    push: mockedPush,
  }),
}));

jest.mock("../services/token-service", () => ({
  saveToken: jest.fn(),
}));

global.fetch = jest.fn();

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar inputs e botão de criar conta", () => {
    const { getByPlaceholderText, getByText } = render(<Register />);

    expect(getByPlaceholderText("Username")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Repeat Password")).toBeTruthy();
    expect(getByText("Create Account")).toBeTruthy();
  });

  it("deve mostrar erro de validação de senha se for fraca", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <Register />
    );

    fireEvent.changeText(getByPlaceholderText("Password"), "abc");
    fireEvent.changeText(getByPlaceholderText("Repeat Password"), "abc");
    fireEvent.press(getByText("Create Account"));

    expect(
      await findByText(/Password must be at least 8 characters/)
    ).toBeTruthy();
  });

  it("deve mostrar erro se senhas forem diferentes", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <Register />
    );

    fireEvent.changeText(getByPlaceholderText("Password"), "Senha123!");
    fireEvent.changeText(
      getByPlaceholderText("Repeat Password"),
      "Diferente123!"
    );
    fireEvent.press(getByText("Create Account"));

    expect(await findByText(/Passwords do not match/)).toBeTruthy();
  });

  it("deve registrar, logar e redirecionar para home com sucesso", async () => {
    const fakeToken = "abc123";

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Signup
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: fakeToken }), // Login
      });

    const { getByPlaceholderText, getByText } = render(<Register />);
    fireEvent.changeText(getByPlaceholderText("Username"), "usuario");
    fireEvent.changeText(getByPlaceholderText("Email"), "teste@email.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "Senha123!");
    fireEvent.changeText(getByPlaceholderText("Repeat Password"), "Senha123!");
    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      const { saveToken } = require("../services/token-service");
      const { useRouter } = require("expo-router");
      const router = useRouter();

      expect(saveToken).toHaveBeenCalledWith(fakeToken);
      expect(router.replace).toHaveBeenCalledWith("/(tabs)/home");
    });
  });

  it("deve exibir erro se o cadastro falhar", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Username já em uso" }),
    });

    const { getByPlaceholderText, getByText, findByText } = render(
      <Register />
    );
    fireEvent.changeText(getByPlaceholderText("Username"), "usuarioexistente");
    fireEvent.changeText(getByPlaceholderText("Email"), "email@teste.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "Senha123!");
    fireEvent.changeText(getByPlaceholderText("Repeat Password"), "Senha123!");
    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Username já em uso")).toBeTruthy();
  });
});
