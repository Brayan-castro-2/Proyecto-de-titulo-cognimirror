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

    // Ruta absoluta del script de VBScript
    const vbsPath = path.join(process.cwd(), 'scripts', 'press_key.vbs');

    // Ejecutar cscript (consola nativa) de forma asíncrona e instantánea (<10ms)
    const cmd = `cscript //Nologo "${vbsPath}" "${sendKey}"`;

    console.log(`[API Keyboard] Inyectando tecla física global de Windows por cscript: ${action.toUpperCase()}`);

    // Ejecutar el comando de forma asíncrona de inmediato
    exec(cmd, (error) => {
      if (error) {
        console.error('[API Keyboard] Error ejecutando inyección por cscript:', error.message);
      }
    });

    return NextResponse.json({ success: true, action });

  } catch (err) {
    console.error('[API Keyboard] Error crítico:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
