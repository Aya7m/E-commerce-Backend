
import jwt from 'jsonwebtoken'
import { User } from '../../database/Models/user.model.js'

export const auth = () => {
    return async (req, res, next) => {
        const { token } = req.headers
        if (!token) res.status(404).json({ message: "please signin first" })

        if (!token.startsWith('noteApp')) return res.status(401).json({ message: "invalid token" })
        const oraginalToken = token.split(" ")[1];
        const decoaded = jwt.verify(oraginalToken, 'signInToken')
        if (!decoaded?.userId) return res.status(400).json({ message: "invalid token payload" })

        const user = await User.findById(decoaded.userId).select("-password")
        if (!user) return res.status(404).json({ message: "please signUp and try tp login" })

        req.authaUser = user
        next()

    }


}