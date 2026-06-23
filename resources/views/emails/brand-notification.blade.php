<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
</head>
<body style="margin:0; padding:0; background:#f7f3cf; font-family:Arial, Helvetica, sans-serif; color:#1e0b54;">
    <div style="background:
        radial-gradient(circle at top left, rgba(127,35,206,0.18), transparent 35%),
        radial-gradient(circle at bottom right, rgba(30,11,84,0.14), transparent 32%),
        linear-gradient(180deg, #fffdf1 0%, #faf7d8 55%, #f2edc2 100%);
        padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px; margin:0 auto;">
            <tr>
                <td style="padding-bottom:20px; text-align:center;">
                    <img src="{{ asset('assets/SMART-15.png') }}" alt="SmartSend" style="width:180px; max-width:100%; height:auto; margin:0 auto 12px;">
                </td>
            </tr>
            <tr>
                <td style="background:rgba(255,254,245,0.98); border:1px solid #d9d09d; border-radius:28px; box-shadow:0 18px 45px -30px rgba(30,11,84,0.24); overflow:hidden;">
                    <div style="padding:32px 28px 24px;">
                        <div style="font-size:11px; line-height:1.4; letter-spacing:0.32em; text-transform:uppercase; color:#7f23ce; margin-bottom:14px;">
                            {{ $eyebrow }}
                        </div>
                        <h1 style="margin:0 0 14px; font-size:30px; line-height:1.15; color:#1e0b54;">
                            {{ $title }}
                        </h1>
                        <p style="margin:0 0 16px; font-size:15px; line-height:1.8; color:#3c2976;">
                            Hola {{ $recipientName }},
                        </p>
                        <p style="margin:0 0 22px; font-size:15px; line-height:1.8; color:#3c2976;">
                            {{ $intro }}
                        </p>

                        @if (!empty($highlight))
                            <div style="margin:0 0 22px; padding:18px 20px; border-radius:22px; border:1px solid #8a73d3; background:rgba(127,35,206,0.08); color:#1e0b54; font-size:17px; font-weight:700; line-height:1.5;">
                                {{ $highlight }}
                            </div>
                        @endif

                        @if (!empty($details))
                            <div style="margin:0 0 24px; padding:20px; border-radius:24px; border:1px solid #d9d09d; background:#fffdf4;">
                                @foreach ($details as $label => $value)
                                    <div style="{{ $loop->last ? '' : 'margin-bottom:12px;' }}">
                                        <div style="margin-bottom:4px; font-size:11px; line-height:1.4; letter-spacing:0.24em; text-transform:uppercase; color:#6f61a1;">
                                            {{ $label }}
                                        </div>
                                        <div style="font-size:15px; line-height:1.7; color:#1e0b54; word-break:break-word;">
                                            {!! nl2br(e($value)) !!}
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endif

                        <div style="margin:0 0 24px; text-align:center;">
                            <a href="{{ $ctaUrl }}" style="display:inline-block; padding:14px 24px; border-radius:999px; background:#7f23ce; color:#fffdf4; font-size:14px; font-weight:700; letter-spacing:0.08em; text-decoration:none; text-transform:uppercase;">
                                {{ $ctaLabel }}
                            </a>
                        </div>

                        <p style="margin:0; font-size:14px; line-height:1.8; color:#3c2976;">
                            {{ $outro }}
                        </p>
                    </div>

                    <div style="border-top:1px solid #d9d09d; padding:18px 28px 24px; background:rgba(243,238,190,0.42);">
                        <p style="margin:0; font-size:12px; line-height:1.7; color:#6f61a1;">
                            Este correo fue generado automáticamente por SmartSend Prestige Studio.
                        </p>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
