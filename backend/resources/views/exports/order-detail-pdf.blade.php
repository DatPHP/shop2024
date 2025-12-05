<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2196F3;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            color: #2196F3;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .info-section {
            margin-bottom: 25px;
        }
        .info-section h2 {
            color: #2196F3;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 5px;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            color: #555;
            padding: 5px 10px 5px 0;
            width: 150px;
        }
        .info-value {
            display: table-cell;
            color: #333;
            padding: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #2196F3;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-section {
            margin-top: 20px;
            padding: 15px;
            background-color: #e3f2fd;
            border: 2px solid #2196F3;
            border-radius: 5px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 14px;
        }
        .total-label {
            font-weight: bold;
            color: #333;
        }
        .total-value {
            font-weight: bold;
            color: #2196F3;
            font-size: 18px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .customer-info, .order-info {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Order #{{ $order->id }}</p>
        <p>Generated on: {{ $date }}</p>
    </div>

    <!-- Customer Information -->
    <div class="info-section">
        <h2>Customer Information</h2>
        <div class="customer-info">
            @if($order->customer)
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-label">Customer ID:</div>
                        <div class="info-value">#{{ $order->customer->id }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Username:</div>
                        <div class="info-value">{{ $order->customer->username }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email:</div>
                        <div class="info-value">{{ $order->customer->email }}</div>
                    </div>
                    @if($order->customer->phone_number)
                    <div class="info-row">
                        <div class="info-label">Phone:</div>
                        <div class="info-value">{{ $order->customer->phone_number }}</div>
                    </div>
                    @endif
                    @if($order->customer->address)
                    <div class="info-row">
                        <div class="info-label">Address:</div>
                        <div class="info-value">{{ $order->customer->address }}</div>
                    </div>
                    @endif
                </div>
            @else
                <p>Customer information not available</p>
            @endif
        </div>
    </div>

    <!-- Order Information -->
    <div class="info-section">
        <h2>Order Information</h2>
        <div class="order-info">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Order ID:</div>
                    <div class="info-value">#{{ $order->id }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Order Date:</div>
                    <div class="info-value">{{ $order->order_date->format('Y-m-d H:i:s') }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Total Items:</div>
                    <div class="info-value">{{ $order->orderDetails->count() }} item(s)</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Total Quantity:</div>
                    <div class="info-value">{{ $order->orderDetails->sum('quantity') }} unit(s)</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Created At:</div>
                    <div class="info-value">{{ $order->created_at->format('Y-m-d H:i:s') }}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Products List -->
    <div class="info-section">
        <h2>Products in Order</h2>
        @if($order->orderDetails && $order->orderDetails->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product Name</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->orderDetails as $index => $detail)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $detail->product->title ?? 'Product N/A' }}</strong>
                                @if($detail->product && $detail->product->description)
                                    <br><small style="color: #666;">{{ Str::limit($detail->product->description, 50) }}</small>
                                @endif
                            </td>
                            <td class="text-center">{{ $detail->quantity }}</td>
                            <td class="text-right">${{ number_format($detail->unit_price, 2) }}</td>
                            <td class="text-right"><strong>${{ number_format($detail->quantity * $detail->unit_price, 2) }}</strong></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="text-align: center; color: #666; padding: 20px;">No products in this order</p>
        @endif
    </div>

    <!-- Total Section -->
    <div class="total-section">
        <div class="total-row">
            <span class="total-label">Total Amount:</span>
            <span class="total-value">${{ number_format($order->total_price, 2) }}</span>
        </div>
    </div>

    <div class="footer">
        <p>This is an official invoice generated by Shop2026 E-commerce System</p>
        <p>Thank you for your business!</p>
    </div>
</body>
</html>

