import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createDecipheriv } from 'crypto';

function decrypt(encryptedText: string) {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    // Ensure ENCRYPTION_KEY is a 64 character hex string (32 bytes)
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export const data = new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Ask the AI a question')
    .addStringOption(option => 
        option.setName('prompt')
            .setDescription('The prompt for the AI')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    const guildId = interaction.guildId!;
    const aiConfig = await prisma.aIConfig.findUnique({ where: { guildId } });
    
    if (!aiConfig) {
        return interaction.editReply('AI is not configured for this server. The owner must set the API key in the dashboard.');
    }
    
    try {
        const apiKey = decrypt(aiConfig.encryptedKey);
        const prompt = interaction.options.getString('prompt', true);
        let responseText = '';
        
        if (aiConfig.provider === 'openai') {
            const openai = new OpenAI({ apiKey });
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4-turbo",
            });
            responseText = completion.choices[0].message.content || 'No response';
        } else if (aiConfig.provider === 'anthropic') {
            const anthropic = new Anthropic({ apiKey });
            const msg = await anthropic.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }]
            });
            responseText = (msg.content[0] as any).text;
        } else if (aiConfig.provider === 'gemini') {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            responseText = response.text();
        }
        
        if (responseText.length > 2000) {
            responseText = responseText.slice(0, 1997) + '...';
        }
        
        await interaction.editReply(responseText);
    } catch (e) {
        console.error(e);
        await interaction.editReply('Error communicating with the AI provider. Check dashboard configuration.');
    }
}
