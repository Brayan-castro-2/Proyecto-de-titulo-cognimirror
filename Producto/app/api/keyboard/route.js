import { exec } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { action } = await request.json();

    if (!action || (action !== 'right' && action !== 'left')) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "right" o "left".' },
        { status: 400 }
      );
    }

    // Traducir acción a tecla de SendKeys de .NET
    const sendKey = action === 'right' ? '{RIGHT}' : '{LEFT}';

    // Comando de PowerShell que carga el ensamblado de System.Windows.Forms y envía la tecla a Windows
    const powershellCmd = `powershell -Command "[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.SendKeys]::SendWait('${sendKey}')"`;

    console.log(`[API Keyboard] Ejecutando simulación de tecla global: ${action.toUpperCase()}`);

    // Ejecutar el comando en el sistema operativo Windows de forma asíncrona
    exec(powershellCmd, (error, stdout, stderr) => {
      if (error) {
        console.error('[API Keyboard] Error ejecutando PowerShell:', error.message);
      }
    });

    return NextResponse.json({ success: true, action });

  } catch (err) {
    console.error('[API Keyboard] Error crítico:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
