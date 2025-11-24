/**
 * Email Service
 * 
 * Handles all email sending via Resend
 */

import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Use Resend's test domain for development, custom domain for production
const FROM_EMAIL = import.meta.env.PROD 
    ? 'RemoteJobsBR <noreply@remotejobsbr.com>' 
    : 'RemoteJobsBR <onboarding@resend.dev>';
const REPLY_TO_EMAIL = 'artsourcebrazil@gmail.com';
const SITE_URL = import.meta.env.SITE || 'https://remotejobsbr.com';

/**
 * Send payment confirmation email
 * Sent after Stripe payment succeeds
 */
export async function sendPaymentConfirmationEmail(
    to: string,
    jobTitle: string,
    companyName: string,
    paidAt: Date
) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            reply_to: REPLY_TO_EMAIL,
            subject: '✅ Pagamento confirmado - Sua vaga está em análise',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FFDC5C; border: 2px solid #000; padding: 20px; margin-bottom: 20px; }
        .content { background: #fff; border: 2px solid #000; padding: 30px; }
        .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        h1 { margin: 0 0 10px 0; font-size: 24px; }
        .steps { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        .steps ol { margin: 0; padding-left: 20px; }
        .details { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Pagamento Confirmado!</h1>
        </div>
        
        <div class="content">
            <p>Olá,</p>
            
            <p>Recebemos seu pagamento com sucesso!</p>
            
            <p>Sua vaga <strong>"${jobTitle}"</strong> está agora em análise pela nossa equipe.</p>
            
            <div class="steps">
                <p><strong>O que acontece agora:</strong></p>
                <ol>
                    <li>⏳ <strong>Revisão manual</strong> (até 24 horas)</li>
                    <li>✅ <strong>Aprovação e publicação</strong></li>
                    <li>📧 <strong>Você receberá um email</strong> quando for publicada</li>
                </ol>
            </div>
            
            <div class="details">
                <p><strong>Detalhes da vaga:</strong></p>
                <ul>
                    <li><strong>Título:</strong> ${jobTitle}</li>
                    <li><strong>Empresa:</strong> ${companyName}</li>
                    <li><strong>Pago em:</strong> ${paidAt.toLocaleDateString('pt-BR')} às ${paidAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</li>
                </ul>
            </div>
            
            <p>Alguma dúvida? Responda este email.</p>
            
            <p>Obrigado,<br><strong>Equipe RemoteJobsBR</strong></p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} RemoteJobsBR - Vagas remotas para talentos brasileiros</p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('❌ Failed to send payment confirmation email:', error);
            throw error;
        }

        console.log(`📧 Payment confirmation email sent to ${to}`);
        return data;
    } catch (error) {
        console.error('Email sending error:', error);
        // Don't throw - email failure shouldn't break the payment flow
        return null;
    }
}

/**
 * Send job approved email
 * Sent when admin approves and publishes the job
 */
export async function sendJobApprovedEmail(
    to: string,
    jobTitle: string,
    jobUrl: string
) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            reply_to: REPLY_TO_EMAIL,
            subject: '🎉 Sua vaga foi aprovada e publicada!',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #00C853; border: 2px solid #000; padding: 20px; margin-bottom: 20px; color: #fff; }
        .content { background: #fff; border: 2px solid #000; padding: 30px; }
        .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        h1 { margin: 0 0 10px 0; font-size: 24px; }
        .button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 20px 0; border-radius: 4px; }
        .highlight { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Vaga Aprovada e Publicada!</h1>
        </div>
        
        <div class="content">
            <p>Olá,</p>
            
            <p>Ótimas notícias! Sua vaga <strong>"${jobTitle}"</strong> foi aprovada e já está online. 🚀</p>
            
            <p style="text-align: center;">
                <a href="${jobUrl}" class="button">Ver Vaga Publicada</a>
            </p>
            
            <div class="highlight">
                <p><strong>📊 Sua vaga ficará ativa por 30 dias</strong></p>
                <p>Durante esse período, ela será vista por centenas de profissionais brasileiros buscando oportunidades remotas.</p>
            </div>
            
            <p>Alguma dúvida? Responda este email.</p>
            
            <p>Obrigado por usar RemoteJobsBR,<br><strong>Equipe RemoteJobsBR</strong></p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} RemoteJobsBR - Vagas remotas para talentos brasileiros</p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('❌ Failed to send approval email:', error);
            throw error;
        }

        console.log(`📧 Job approved email sent to ${to}`);
        return data;
    } catch (error) {
        console.error('Email sending error:', error);
        return null;
    }
}

/**
 * Send job rejected email
 * Sent when admin rejects the job with a reason
 */
export async function sendJobRejectedEmail(
    to: string,
    jobTitle: string,
    reason: string
) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            reply_to: REPLY_TO_EMAIL,
            subject: '⚠️ Sua vaga precisa de ajustes',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FFB300; border: 2px solid #000; padding: 20px; margin-bottom: 20px; }
        .content { background: #fff; border: 2px solid #000; padding: 30px; }
        .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        h1 { margin: 0 0 10px 0; font-size: 24px; }
        .reason { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; }
        .steps { background: #f9f9f9; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        .steps ol { margin: 0; padding-left: 20px; }
        .button { display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; margin: 20px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Ajustes Necessários</h1>
        </div>
        
        <div class="content">
            <p>Olá,</p>
            
            <p>Infelizmente não pudemos aprovar sua vaga <strong>"${jobTitle}"</strong> no momento.</p>
            
            <div class="reason">
                <p><strong>📝 Motivo:</strong></p>
                <p>${reason}</p>
            </div>
            
            <div class="steps">
                <p><strong>O que fazer agora:</strong></p>
                <ol>
                    <li>Faça os ajustes necessários</li>
                    <li>Reenvie a vaga através do formulário</li>
                    <li><strong>Não será cobrado novamente</strong></li>
                </ol>
            </div>
            
            <p style="text-align: center;">
                <a href="${SITE_URL}/post-a-job" class="button">Reenviar Vaga</a>
            </p>
            
            <p>Precisa de ajuda? Responda este email.</p>
            
            <p>Obrigado pela compreensão,<br><strong>Equipe RemoteJobsBR</strong></p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} RemoteJobsBR - Vagas remotas para talentos brasileiros</p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('❌ Failed to send rejection email:', error);
            throw error;
        }

        console.log(`📧 Job rejected email sent to ${to}`);
        return data;
    } catch (error) {
        console.error('Email sending error:', error);
        return null;
    }
}

