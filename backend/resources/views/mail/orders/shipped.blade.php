<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 28px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .message {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #4CAF50;
            margin-bottom: 30px;
        }
        .order-info {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .order-info h2 {
            margin-top: 0;
            color: #333;
            font-size: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #666;
        }
        .info-value {
            color: #333;
        }
        .order-items {
            margin-top: 30px;
        }
        .order-items h2 {
            color: #333;
            font-size: 20px;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #4CAF50;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:last-child td {
            border-bottom: none;
        }
        .total-row {
            background-color: #f9f9f9;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your Order Has Been Shipped!</h1>
        </div>

        <div class="greeting">
            <p>Hello {{ $order->customer->username }},</p>
        </div>

        <div class="message">
            <p><strong>Great news!</strong> Your order has been shipped and is on its way to you. We're excited to get your items to you as soon as possible.</p>
        </div>

        <div class="order-info">
            <h2>Order Information</h2>
            <div class="info-row">
                <span class="info-label">Order Number:</span>
                <span class="info-value">#{{ $order->id }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Order Date:</span>
                <span class="info-value">{{ $order->order_date->format('F d, Y h:i A') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Shipping Address:</span>
                <span class="info-value">{{ $order->customer->address ?? 'N/A' }}</span>
            </div>
        </div>

        <div class="order-items">
            <h2>Order Items</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->orderDetails as $detail)
                    <tr>
                        <td>{{ $detail->product->title ?? 'Product #' . $detail->product_id }}</td>
                        <td>{{ $detail->quantity }}</td>
                        <td>${{ number_format($detail->unit_price, 2) }}</td>
                        <td>${{ number_format($detail->quantity * $detail->unit_price, 2) }}</td>
                    </tr>
                    @endforeach
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right;">Total:</td>
                        <td>${{ number_format($order->total_price, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Thank you for shopping with <strong>Henry & Janes Shop</strong>!</p>
            <p>If you have any questions about your order, please don't hesitate to contact us.</p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>

