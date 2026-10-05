import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadBookingDocuments } from "./booking.documents";
import {
  completeDocumentUpload,
  requestDocumentUpload,
} from "./booking.repository";

vi.mock("./booking.repository", () => ({
  requestDocumentUpload: vi.fn(),
  completeDocumentUpload: vi.fn(),
}));

const target = { subdomain: "movup", reference: "VB-1", uploadToken: "t" };
const photo = (name: string) =>
  new File([new Uint8Array(8)], name, { type: "image/jpeg" });
const files = {
  licence: photo("licence.jpg"),
  insurance: photo("insurance.jpg"),
};
const storage = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", storage);
  storage.mockResolvedValue({ ok: true });
  vi.mocked(requestDocumentUpload).mockImplementation(async (_, file) => ({
    documentId: file.kind,
    url: "https://storage.example/bucket",
    fields: { key: `docs/${file.kind}`, policy: "p" },
  }));
  vi.mocked(completeDocumentUpload).mockResolvedValue(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("uploadBookingDocuments", () => {
  it("reserves each scan, posts it to storage with the file last, and confirms it", async () => {
    expect(await uploadBookingDocuments(target, files)).toEqual([]);

    expect(requestDocumentUpload).toHaveBeenCalledWith(target, {
      kind: "licence",
      name: "licence.jpg",
      contentType: "image/jpeg",
      sizeBytes: 8,
    });
    const [url, init] = storage.mock.calls[0]!;
    expect(url).toBe("https://storage.example/bucket");
    expect(init.method).toBe("POST");
    expect([...(init.body as FormData).keys()]).toEqual([
      "key",
      "policy",
      "file",
    ]);
    expect(completeDocumentUpload).toHaveBeenCalledWith(target, "licence");
    expect(completeDocumentUpload).toHaveBeenCalledWith(target, "insurance");
  });

  it("reports the scans that did not get there, at whichever step", async () => {
    vi.mocked(requestDocumentUpload).mockResolvedValueOnce(null);
    expect(await uploadBookingDocuments(target, files)).toEqual(["licence"]);

    storage.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    storage.mockResolvedValueOnce({ ok: false });
    expect(await uploadBookingDocuments(target, files)).toEqual([
      "licence",
      "insurance",
    ]);

    vi.mocked(completeDocumentUpload).mockResolvedValueOnce(true);
    vi.mocked(completeDocumentUpload).mockResolvedValueOnce(false);
    expect(await uploadBookingDocuments(target, files)).toEqual(["insurance"]);
  });

  it("sends only the scans it is given", async () => {
    await uploadBookingDocuments(target, { insurance: files.insurance });
    expect(requestDocumentUpload).toHaveBeenCalledTimes(1);
  });
});
