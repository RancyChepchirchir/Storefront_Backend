import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middleware/VerifyAuthToken';
import verifyUserId from '../middleware/VerifyuserId';
import { User, UserDB, UserStore } from './../models/user';

const userStore = new UserStore();
const userRouter = express.Router();

const { TOKEN_SECRET } = process.env;

// Handler
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userStore.index();
        res.json(users);
    } catch (e) {
        res.status(500).send(e);
    }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = userStore.show(parseInt(req.params['id']));
        if (user !== undefined) {
            res.status(200).json(user);
        } else {
            res.status(404).send('User not found.');
        }
    } catch (e) {
        res.status(500).send(e);
    }
};

const addDemoUser = async (req: Request, res: Response): Promise<void> => {
    const user = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        password: process.env['DEMO_USER_PASSWORD'],
    };
    try {
        if (!process.env['TOKEN_SECRET']) {
            throw new Error('Missing env variable: TOKEN_SECRET');
        }
        if (!process.env['DEMO_USER_PASSWORD']) {
            throw new Error('Missing env variable: DEMO_USER_PASSWORD');
        }
        const newUser = await userStore.create(user);
        const token = jwt.sign(
            {
                user: {
                    id: newUser.id,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                },
            },
            process.env['TOKEN_SECRET'],
        );
        res.status(201).json(token);
    } catch (e) {
        res.status(500).send(e);
    }
};

const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!TOKEN_SECRET) {
            throw new Error('Missing env variable: TOKEN_SECRET');
        }
        const user: User = req.body;
        const newUser: UserDB = await userStore.create(user);
        const token = jwt.sign(
            {
                user: {
                    id: newUser.id,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                },
            },
            TOKEN_SECRET,
        );
        res.status(201).json(token);
    } catch (e) {
        res.status(500).send(e);
    }
};
const updateUser = async (req: Request, res: Response): Promise<Response<unknown, Record<string, unknown>>> => {
    const user: UserDB = req.body;
    const user_id: number = parseInt(req.params['id'], 10);
    try {
        if (!TOKEN_SECRET) throw new Error('Missing env variable: TOKEN_SECRET');
        const updatedUser = await userStore.update(user_id, user);
        if (!updatedUser) return res.status(404).send('User not found.');
        const token = jwt.sign({ user: updatedUser }, TOKEN_SECRET);
        return res.status(200).send(token);
    } catch (e) {
        return res.status(500).send(e);
    }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = parseInt(req.params['id'], 10);
        const deletedUser = await userStore.delete(user_id);
        res.status(200).json(deletedUser);
    } catch (e) {
        res.status(500).send(e);
    }
};

const authenticateUser = async (req: Request, res: Response): Promise<void> => {
   try{

       const email = req.body.email;
       const password = req.body.password;
   
       if (!TOKEN_SECRET) {
           res.status(500).send('Missing env variable: TOKEN_SECRET');
           return;
       }
   
       const authUser = await userStore.authenticate(email, password);
       if (!authUser) {
           res.status(401).send('Could not authenticate user. Wrong credentials');
           return;
       }
   
       const token = jwt.sign(
           {
               user: {
                   id: authUser.id,
                   first_name: authUser.first_name,
                   last_name: authUser.last_name,
                   email: authUser.email,
               },
           },
           TOKEN_SECRET,
       );
   
       res.status(200).json(token);
   }
   catch(err){
    res.status (500)
    res.json(err)
   }
};

// Routes
userRouter.get('/', verifyAuthToken, getAllUsers);
userRouter.get('/:id', verifyAuthToken, getUser);
userRouter.post('/login', authenticateUser);
userRouter.post('/demoUser', addDemoUser);
userRouter.post('/', verifyAuthToken, addUser);
userRouter.put('/:id', [verifyAuthToken, verifyUserId], updateUser);
userRouter.delete('/:id', [verifyAuthToken, verifyUserId], deleteUser);

export default userRouter;
