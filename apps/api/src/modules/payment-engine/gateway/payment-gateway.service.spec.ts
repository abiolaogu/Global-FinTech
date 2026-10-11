import { PaymentGatewayService } from "./payment-gateway.service";

describe("PaymentGatewayService privacy controls", () => {
  it("never writes the full PAN to 3-D Secure logs", async () => {
    const service = new PaymentGatewayService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const log = jest.fn();
    (service as any).logger.log = log;

    await service.process3DSecure({
      cardNumber: "4111111111111111",
      merchantId: "merchant-1",
      amount: 10,
      currency: "840",
    });

    const rendered = log.mock.calls.flat().join(" ");
    expect(rendered).not.toContain("4111111111111111");
    expect(rendered).toContain("411111******1111");
  });
});
