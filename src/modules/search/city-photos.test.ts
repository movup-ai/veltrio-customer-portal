import { describe, expect, it } from "vitest";
import { cityPhoto } from "./city-photos";

describe("cityPhoto", () => {
  it("gives a listed city its photo at each width", () => {
    const photo = cityPhoto({ city: "Miami", state: "FL" }, [400, 800], 4 / 3);
    expect(photo?.map((variant) => [variant.width, variant.height])).toEqual([
      [400, 300],
      [800, 600],
    ]);
  });

  it("tells namesakes apart and has nothing for a city it does not list", () => {
    expect(cityPhoto({ city: "Miami", state: "OK" }, [400], 1)).toBeUndefined();
    expect(cityPhoto({ city: "Doral", state: null }, [400], 1)).toBeUndefined();
  });
});
