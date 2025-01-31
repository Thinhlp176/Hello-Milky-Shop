import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Pagination, Select } from "antd";
import "./FeedbackManage.css";
import config from "../../config/config";

const { Option } = Select;

const AnsweredFeedbackManage = () => {
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterProductType, setFilterProductType] = useState("all");
    const [filterCommentID, setFilterCommentID] = useState("all");
    const commentsPerPage = 5;

    useEffect(() => {
        fetchComments();
    }, [filterProductType, filterCommentID]);

    const fetchComments = async () => {
        try {
            const response = await fetch(
                `${config.API_ROOT}/api/v1/comment/getAnsweredComments`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch comments");
            }
            const data = await response.json();
            if (!Array.isArray(data.data)) {
                throw new Error("Comments data is not an array");
            }
            let filteredComments = data.data;

            if (filterProductType !== "all") {
                filteredComments = filteredComments.filter(comment =>
                    comment.ProductID.includes(filterProductType)
                );
            }

            if (filterCommentID === "newest") {
                filteredComments.sort((a, b) => b.CommentID - a.CommentID);
            } else if (filterCommentID === "oldest") {
                filteredComments.sort((a, b) => a.CommentID - b.CommentID);
            }

            setComments(filteredComments);
        } catch (error) {
            console.error("Error fetching comments:", error);
            setComments([]);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFilterProductTypeChange = (value) => {
        setFilterProductType(value);
    };

    const handleFilterCommentIDChange = (value) => {
        setFilterCommentID(value);
    };

    const paginatedComments = comments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage);

    return (
        <div className="feedback-manage-thinh-cmt">
            <div className="filters-section-thinh-cmt">
                <Select
                    value={filterProductType}
                    onChange={handleFilterProductTypeChange}
                    style={{ width: 200 }}
                >
                    <Option value="all">Tất cả</Option>
                    <Option value="SM">Sữa cho mẹ bầu</Option>
                    <Option value="SE">Sữa cho em bé</Option>
                </Select>
                <Select
                    value={filterCommentID}
                    onChange={handleFilterCommentIDChange}
                    style={{ width: 200, marginLeft: 10 }}
                >
                    <Option value="all">Tất cả</Option>
                    <Option value="newest">Mới nhất</Option>
                    <Option value="oldest">Cũ nhất</Option>
                </Select>
            </div>
            <div className="comments-section-thinh-cmt">
                {paginatedComments.map((comment) => (
                    <Comment key={comment.CommentID} comment={comment} />
                ))}
                <div className="chuyen-trang-fb">
                    <Pagination
                        current={currentPage}
                        onChange={handlePageChange}
                        total={comments.length}
                        pageSize={commentsPerPage}
                    />
                </div>
            </div>
        </div>
    );
};

const Comment = ({ comment }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetchProduct();
    });

    const fetchProduct = async () => {
        try {
            const response = await fetch(
                `${config.API_ROOT}/api/v1/product/getProductInforID/${comment.ProductID}`
            );
            const data = await response.json();
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product:", error);
        }
    };

    const getInitial = (name) => name.charAt(0).toUpperCase();
    const renderStars = (count) => {
        const roundedCount = Math.round(count);
        return (
            <div className="stars">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < roundedCount ? "filled" : ""}`}>
                        &#9733;
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="comment-thinh-cmt">
            <div className="comment-thinh-fl">
                <div className="bl-rep">
                    <div className="comment-header-thinh-cmt">
                        <div className="initial-thinh-cmt">
                            {getInitial(comment.UserName)}
                        </div>
                        <div className="details-thinh-cmt">
                            <div className="name-and-stars-thinh-cmt">
                                <span className="name-thinh-cmt">{comment.UserName}</span>
                                <span className="stars-thinh-cmt">
                                    {renderStars(comment.Rating)}
                                </span>
                            </div>
                            <div className="comment-content-thinh-cmt">
                                {comment.Description}
                            </div>
                            <div className="time-thinh-cmt">
                                {new Date(comment.CommentDate).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="staff-reply-section-thinh-cmt">
                        <div className="rep-container-thinhrt">
                            <div className="initial-thinh-cmt">
                                {getInitial(comment.StaffName)}
                            </div>
                            <div className="details-thinh-cmt">
                                <div className="rep-title-thinhrt">
                                    {comment.StaffName} <span className="rep-tag-thinhrt">Quản trị viên</span>
                                </div>
                                <div className="reply-content-thinh-cmt">
                                    {comment.Rep}
                                </div>
                                <div className="time-thinh-cmt">
                                    {new Date(comment.RepDate).toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {product && (
                    <div className="product-info-thinh-cmt">
                        <img src={product[0].Image} alt={product[0].ProductName} />
                        <div>
                            <div className="product-name-thinh-cmt">
                                {product[0].ProductName}
                            </div>
                            <div className="product-code-thinh-cmt">
                                Mã SP: {comment.ProductID}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// PropTypes validation for Comment component
Comment.propTypes = {
    comment: PropTypes.shape({
        CommentID: PropTypes.number.isRequired,
        UserName: PropTypes.string.isRequired,
        Rating: PropTypes.number.isRequired,
        Description: PropTypes.string.isRequired,
        CommentDate: PropTypes.string.isRequired,
        StaffName: PropTypes.string.isRequired,
        Rep: PropTypes.string.isRequired,
        RepDate: PropTypes.string.isRequired,
        ProductID: PropTypes.string.isRequired,
    }).isRequired,
};

export default AnsweredFeedbackManage;
