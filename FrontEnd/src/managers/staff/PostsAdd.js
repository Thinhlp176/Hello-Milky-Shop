import React, { useState } from 'react';
import './Posts.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';  // Import CSS cho ReactQuill

function PostsAdd() {
    const [content, setContent] = useState('');

    const handleContentChange = (value) => {
        setContent(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý logic submit form ở đây
        console.log('Staff ID:', e.target['staff-id'].value);
        console.log('Categories:', e.target.catergo.value);
        console.log('Post Title:', e.target.title.value);
        console.log('Content:', content);
        // Gửi dữ liệu này đến server hoặc API của bạn
    };

    return (
        <div className="container post-form">
            <h2>Create New Post</h2>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col">
                        <label htmlFor="staff-id">Staff ID</label>
                        <input type="text" className="form-control" id="staff-id" name="staff-id" required />
                    </div>
                    <div className="col">
                        <label htmlFor="catergo">Categories</label>
                        <input type="text" className="form-control" id="catergo" name="catergo" required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label htmlFor="title">Post Title</label>
                        <input type="text" className="form-control" id="title" name="title" required />
                    </div>
                    <div className="col">
                        <label htmlFor="product-image">Image:</label>
                        <input type="file" className="form-control" id="product-image" name="product-image" required />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label htmlFor="content">Content</label>
                        <ReactQuill
                            id="content"
                            value={content}
                            onChange={handleContentChange}
                            required
                            className="full-width"
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Create Post</button>
            </form>
        </div>
    );
}

export default PostsAdd;