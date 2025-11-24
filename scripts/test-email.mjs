/**
 * Test Email Script
 * 
 * Tests Resend integration by sending a test email
 * 
 * Usage:
 *   node scripts/test-email.mjs your-email@example.com
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const recipientEmail = process.argv[2];

if (!recipientEmail) {
    console.error('❌ Please provide an email address:');
    console.error('   node scripts/test-email.mjs your-email@example.com');
    process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in .env');
    console.error('   Add: RESEND_API_KEY=re_xxxxxxxxxxxxx');
    process.exit(1);
}

console.log('📧 Sending test email to:', recipientEmail);
console.log('🔑 Using API key:', process.env.RESEND_API_KEY.substring(0, 10) + '...');

try {
    const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev', // Use this for testing without custom domain
        to: [recipientEmail],
        subject: '✅ RemoteJobsBR - Email Test',
        html: `
            <h1>Email funcionando! 🎉</h1>
            <p>Se você recebeu este email, a integração com Resend está funcionando corretamente.</p>
            <p><strong>Próximos passos:</strong></p>
            <ol>
                <li>Configure um domínio custom no Resend (opcional)</li>
                <li>Teste o fluxo completo de postagem de vaga</li>
                <li>Verifique se os emails são enviados automaticamente</li>
            </ol>
            <hr>
            <p><small>Enviado via script de teste: scripts/test-email.mjs</small></p>
        `,
    });

    if (error) {
        console.error('❌ Failed to send email:', error);
        process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('📊 Response:', data);
    console.log('\n💡 Check your inbox (and spam folder)');
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}

