import express, { Request, Response } from 'express';

console.log("Starting server");

const app = express();
const port = 3000;

app.use(express.json());

app.post('/identify', (req: Request, res: Response) => {
    try{

        console.log("req is ",req);
        
        const requestBody=req.body
        console.log("req is ",requestBody);
        
        const { email, phoneNumber } = req.body;
        
        if (!email && !phoneNumber) {
            return res.status(400).json({ error: 'Either email or phoneNumber must be provided.' });
        }
        
        // Rest of your logic will go here
        console.log("Email recied is",email, "\tphoneNumber ",phoneNumber );
        
        
        res.status(200).json({ message: 'Identify endpoint called successfully.' });
    }
    catch(err){
        console.log("Error ocuured",err);
        
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

