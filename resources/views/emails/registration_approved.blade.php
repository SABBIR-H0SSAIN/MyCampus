<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to MyCampus</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

          {{-- ── Header ── --}}
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:16px;">
                <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🎓 MyCampus</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;line-height:1.3;">
                You're officially in! 🎉
              </h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">
                Your KUET campus account has been approved
              </p>
            </td>
          </tr>

          {{-- ── Body ── --}}
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:#cbd5e1;font-size:16px;line-height:1.6;">
                Hi <strong style="color:#ffffff;">{{ $student->name }}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.7;">
                Great news — an administrator has reviewed and <strong style="color:#4ade80;">approved</strong> your MyCampus
                registration. You now have full access to all campus features.
              </p>

              {{-- ── Info Card ── --}}
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:12px;border:1px solid #334155;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your Account Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
                          <span style="color:#64748b;font-size:13px;">Name</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1e293b;text-align:right;">
                          <span style="color:#e2e8f0;font-size:13px;font-weight:600;">{{ $student->name }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
                          <span style="color:#64748b;font-size:13px;">Roll Number</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1e293b;text-align:right;">
                          <span style="color:#e2e8f0;font-size:13px;font-weight:600;">{{ $student->roll_number }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
                          <span style="color:#64748b;font-size:13px;">Department</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #1e293b;text-align:right;">
                          <span style="color:#e2e8f0;font-size:13px;font-weight:600;">{{ $student->department?->value ?? $student->department }}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#64748b;font-size:13px;">Email</span>
                        </td>
                        <td style="padding:8px 0;text-align:right;">
                          <span style="color:#e2e8f0;font-size:13px;font-weight:600;">{{ $student->email }}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {{-- ── What you can do ── --}}
              <p style="margin:0 0 16px;color:#e2e8f0;font-size:14px;font-weight:600;">Here's what you can now access:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                @foreach([
                  ['🛍️', 'Marketplace', 'Buy & sell items within the campus community'],
                  ['🔄', 'Exchange Board', 'Trade items with fellow students'],
                  ['🏠', 'Roommate Finder', 'Find compatible flatmates near KUET'],
                  ['🩸', 'Blood Donation', 'Request or offer blood donations on campus'],
                  ['📚', 'Resource Hub', 'Share & download academic notes and materials'],
                ] as [$icon, $title, $desc])
                <tr>
                  <td style="padding:10px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;vertical-align:top;padding-top:2px;">
                          <span style="font-size:18px;">{{ $icon }}</span>
                        </td>
                        <td>
                          <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600;">{{ $title }}</p>
                          <p style="margin:2px 0 0;color:#64748b;font-size:12px;">{{ $desc }}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                @endforeach
              </table>

              {{-- ── CTA Button ── --}}
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ $loginUrl }}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:10px;padding:14px 40px;letter-spacing:0.3px;">
                      🚀 Log In to MyCampus
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {{-- ── Footer ── --}}
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #334155;text-align:center;">
              <p style="margin:0 0 8px;color:#475569;font-size:12px;">
                This email was sent by the MyCampus system. Please do not reply to this email.
              </p>
              <p style="margin:0;color:#334155;font-size:11px;">
                Khulna University of Engineering &amp; Technology · Khulna, Bangladesh
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
