import express, { Request, Response } from 'express';
import { identifyContact } from './lib/actions';

console.log("Starting server");

const app = express();
const port = 3000;

app.use(express.json());

app.post('/identify', async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;
        
        const result = await identifyContact(email, phoneNumber);
        return res.status(200).json(result);

    } catch (err: any) {
        console.error("Error occurred resolving identify endpoint:", err);
        if (err.message === 'Either email or phoneNumber must be provided.') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});