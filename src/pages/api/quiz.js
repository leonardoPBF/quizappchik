import prisma from "@/lib/prisma_responses";

export default async function handler(req, res) {
    if(req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const data = req.body;        

        const { question, options, answer } = req.body;

        // Validate required fields for quiz creation before return response

        if (!question || !options || !answer) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newQuiz = await prisma.quiz.create({
            data: {
                question,
                options,
                answer
            }
        });
        console.log('New quiz created:', newQuiz);

        return res.status(201).json(newQuiz);

    } catch (error) {
        console.error('Error creating quiz:', error);
        return res.status(500).json({ message: 'Error al guardar' });
    }
}