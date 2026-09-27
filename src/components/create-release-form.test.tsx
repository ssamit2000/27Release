import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CreateReleaseForm } from "@/components/create-release-form";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("create release form", () => {
  beforeEach(() => { jest.clearAllMocks(); global.fetch = jest.fn(); });

  it("shows required field errors without submitting", async () => {
    render(<CreateReleaseForm />);
    fireEvent.click(screen.getByRole("button", { name: "Create Release" }));
    expect(await screen.findByText("Release name is required.")).toBeInTheDocument();
    expect(screen.getByText("Release date is required.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a release and navigates to its detail page", async () => {
    jest.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ release: { id: "rel_1" } }) } as Response);
    render(<CreateReleaseForm />);
    fireEvent.change(screen.getByLabelText("Release name"), { target: { value: "v2.8.0" } });
    fireEvent.change(screen.getByLabelText("Release date"), { target: { value: "2026-09-30" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Release" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/releases/rel_1"));
  });
});
