import { exec } from 'child_process';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
  try {
    const { action } = await request.json();

    if (!action || (action !== 'right' && action !== 'left')) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "right" o "left".' },
        { status: 400 }
      );
    }

    // Traducir acción a tecla de WScript SendKeys
    const sendKey = action === 'right' ? '{RIGHT}' : '{LEFT}';

    // Comando nativo de PowerShell usando objeto COM de WScript para máxima compatibilidad
    const cmd = `powershell -Command "(New-Object -ComObject WScript.Shell).SendKeys('${sendKey}')"`;

    console.log(`[API Keyboard] Ejecutando simulación de tecla instantánea por PowerShell: ${action.toUpperCase()}`);

    // Ejecutar el comando de forma asíncrona de inmediato
    exec(cmd, (error) => {
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
