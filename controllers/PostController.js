import Post from '../models/post.js'

class PostController {
  static async index (req, res) {
    const page = req.query.page || 1
    const size = req.query.size || 10

    try {
      const posts = await Post.find().skip((page - 1) * size).limit(size)
      const totalItems = await Post.countDocuments()
      const totalPages = Math.ceil(totalItems / size)
      res.status(200).json({ posts, pages: totalPages, items: totalItems })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async show (req, res) {
    try {
      const post = await Post.findById(req.params.id)

      if (!post) {
        return res.status(404).json({ message: 'Post not found' })
      }

      res.status(200).json(post)
    } catch (error) {
      res.status(404).json({ message: 'Post not found.' })
    }
  }

  static async store (req, res) {
    try {
      const post = await Post.create(req.body)
      res.status(201).json(post)
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
      }
      res.status(500).json({ message: error.message })
    }
  }

  static async update (req, res) {
    try {
      const post = await Post.findById(req.params.id)

      if (!post) {
        return res.status(404).json({ message: 'Post not found' })
      }

      post.title = req.body.title
      post.content = req.body.content
      await post.save()

      res.status(200).json(post)
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
      }
      res.status(500).json({ message: error.message })
    }
  }

  static async destroy (req, res) {
    try {
      const post = await Post.findByIdAndDelete(req.params.id)

      if (!post) {
        return res.status(404).json({ message: 'Post not found' })
      }

      res.status(200).json({ message: 'Post deleted!' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  static async search (req, res) {
    const page = req.query.page || 1
    const size = req.query.size || 1

    try {
      const { q } = req.query

      if (!q) {
        return res.status(400).json({ message: 'The search query is required' })
      }

      const filter = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ]
      }

      const posts = await Post.find(filter).skip((page - 1) * size).limit(size)
      const totalItems = await Post.countDocuments(filter)
      const totalPages = Math.ceil(totalItems / size)

      res.status(200).json({ posts, pages: totalPages, items: totalItems })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

export default PostController
