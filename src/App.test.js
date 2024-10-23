import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

describe("Hypotheek Maatje", () => {
  test("berekent hypotheek correct bij geldige invoer", async () => {
    render(<App />);

    fireEvent.change(screen.getByTestId(/jaarinkomen/i), {
      target: { value: "50000" },
    });
    fireEvent.change(screen.getByLabelText(/jaarinkomen partner/i), {
      target: { value: "30000" },
    });
    fireEvent.change(screen.getByLabelText(/postcode/i), {
      target: { value: "1234AB" }, // Geldige postcode
    });
    fireEvent.change(screen.getByLabelText(/rentevaste periode/i), {
      target: { value: "30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /bereken hypotheek/i }));

    await waitFor(() => {
      expect(screen.getByText(/maximaal te lenen/i)).toBeInTheDocument();
    });
  });

  test("toont foutmelding bij ongeldige postcode", async () => {
    render(<App />);

    fireEvent.change(screen.getByTestId(/jaarinkomen/i), {
      target: { value: "50000" },
    });
    fireEvent.change(screen.getByLabelText(/jaarinkomen partner/i), {
      target: { value: "30000" },
    });

    // Ongeldige postcode
    fireEvent.change(screen.getByLabelText(/postcode/i), {
      target: { value: "1234" }, // Ongeldige postcode
    });

    fireEvent.change(screen.getByLabelText(/rentevaste periode/i), {
      target: { value: "30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /bereken hypotheek/i }));

    await waitFor(() => {
      // Controleer of de foutmelding wordt weergegeven
      expect(
        screen.getByText((content, element) =>
          content.includes("ongeldige postcode ingevoerd")
        )
      ).toBeInTheDocument();
    });
  });

  test("toont geen resultaat bij lege invoer", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /bereken hypotheek/i }));

    await waitFor(() => {
      expect(screen.queryByText(/maximaal te lenen/i)).not.toBeInTheDocument();
    });
  });

  test("berekent de hypotheek correct zonder partner inkomen en studieschuld", () => {
    render(<App />);

    // Voer jaarinkomen in
    const incomeInput = screen.getByLabelText(/Jaarinkomen:/i);
    fireEvent.change(incomeInput, { target: { value: "50000" } });

    // Voer postcode in
    const postcodeInput = screen.getByLabelText(/Postcode:/i);
    fireEvent.change(postcodeInput, { target: { value: "1234AB" } });

    // Selecteer rentevaste periode
    const termSelect = screen.getByLabelText(/Rentevaste periode:/i);
    fireEvent.change(termSelect, { target: { value: "30" } });

    // Klik op bereken knop
    const button = screen.getByText(/Bereken hypotheek/i);
    fireEvent.click(button);

    // Controleer resultaat
    expect(screen.getByText(/Maximaal te lenen:/i)).toBeInTheDocument();
    expect(screen.getByText("€212500.00")).toBeInTheDocument();
  });

  test("berekent hypotheek correct met partner inkomen zonder studieschuld", () => {
    render(<App />);

    // Voer jaarinkomen in
    const incomeInput = screen.getByLabelText(/Jaarinkomen:/i);
    fireEvent.change(incomeInput, { target: { value: "50000" } });

    // Voer partner inkomen in
    const partnerIncomeInput = screen.getByLabelText(/Jaarinkomen partner/i);
    fireEvent.change(partnerIncomeInput, { target: { value: "30000" } });

    // Voer postcode in
    const postcodeInput = screen.getByLabelText(/Postcode:/i);
    fireEvent.change(postcodeInput, { target: { value: "1234AB" } });

    // Selecteer rentevaste periode
    const termSelect = screen.getByLabelText(/Rentevaste periode:/i);
    fireEvent.change(termSelect, { target: { value: "30" } });

    // Klik op bereken knop
    const button = screen.getByText(/Bereken hypotheek/i);
    fireEvent.click(button);

    // Controleer resultaat
    expect(screen.getByText(/Maximaal te lenen:/i)).toBeInTheDocument();
    expect(screen.getByText("€340000.00")).toBeInTheDocument();
  });

  test("excludeert hypotheek berekening bij verboden postcode", () => {
    render(<App />);

    // Voer jaarinkomen in
    const incomeInput = screen.getByLabelText(/Jaarinkomen:/i);
    fireEvent.change(incomeInput, { target: { value: "50000" } });

    // Voer uitgesloten postcode in
    const postcodeInput = screen.getByLabelText(/Postcode:/i);
    fireEvent.change(postcodeInput, { target: { value: "9679" } });

    // Klik op bereken knop
    const button = screen.getByText(/Bereken hypotheek/i);
    fireEvent.click(button);

    // Controleer dat er geen resultaten zijn
    expect(screen.queryByText(/Maximaal te lenen:/i)).not.toBeInTheDocument();
  });

  test("vermindert het maximale leenbedrag bij studieschuld", () => {
    render(<App />);

    // Voer jaarinkomen in
    const incomeInput = screen.getByLabelText(/Jaarinkomen:/i);
    fireEvent.change(incomeInput, { target: { value: "50000" } });

    // Vink studieschuld aan
    const studyDebtCheckbox = screen.getByLabelText(/Studieschuld:/i);
    fireEvent.click(studyDebtCheckbox);

    // Voer postcode in
    const postcodeInput = screen.getByLabelText(/Postcode:/i);
    fireEvent.change(postcodeInput, { target: { value: "1234AB" } });

    // Selecteer rentevaste periode
    const termSelect = screen.getByLabelText(/Rentevaste periode:/i);
    fireEvent.change(termSelect, { target: { value: "30" } });

    // Klik op bereken knop
    const button = screen.getByText(/Bereken hypotheek/i);
    fireEvent.click(button);

    // Controleer aangepast leenbedrag
    expect(screen.getByText(/Maximaal te lenen:/i)).toBeInTheDocument();
    expect(screen.getByText("€159375.00")).toBeInTheDocument();
  });

  test("berekent hypotheek correct met verschillende rentevaste periodes", () => {
    render(<App />);

    // Voer jaarinkomen in
    const incomeInput = screen.getByLabelText(/Jaarinkomen:/i);
    fireEvent.change(incomeInput, { target: { value: "50000" } });

    // Voer postcode in
    const postcodeInput = screen.getByLabelText(/Postcode:/i);
    fireEvent.change(postcodeInput, { target: { value: "1234AB" } });

    // Selecteer een rentevaste periode van 5 jaar
    const termSelect = screen.getByLabelText(/Rentevaste periode:/i);
    fireEvent.change(termSelect, { target: { value: "5" } });

    // Klik op bereken knop
    const button = screen.getByText(/Bereken hypotheek/i);
    fireEvent.click(button);

    // Controleer resultaat voor 5 jaar
    expect(screen.getByText(/Maximaal te lenen:/i)).toBeInTheDocument();
    expect(screen.getByText("€212500.00")).toBeInTheDocument();
    expect(screen.getByText(/Maandlasten:/i)).toBeInTheDocument();
  });
});
