import asyncHandler from "express-async-handler";
export const paymentQrCtrl = asyncHandler(async (req, res) => {
    const { 
        orderId,
          orderNumber,
          amount,
          currency 
        } = req.body;

    const amountVND = amount ;
    res.json({
        status: "success",
        message: "brand updated successfully",
        qrCodeUrl: `https://img.vietqr.io/image/vcb-0352717003-print.jpg?amount=${amountVND}&addInfo=${orderId}&accountName=TRAN XUAN THAI`,
    });
});