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

    // Ruta al script de VBScript en caliente
    const vbsPath = path.join(process.cwd(), 'scripts', 'press_key.vbs');

    const cmd = `wscript //Nologo "${vbsPath}" "${sendKey}"`;

    console.log(`[API Keyboard] Ejecutando simulación de tecla instantánea: ${action.toUpperCase()}`);

    // Ejecutar el comando de forma asíncrona de inmediato
    exec(cmd, (error) => {
      if (error) {
        console.error('[API Keyboard] Error ejecutando VBScript:', error.message);
      }
    });

    return NextResponse.json({ success: true, action });

  } catch (err) {
    console.error('[API Keyboard] Error crítico:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
