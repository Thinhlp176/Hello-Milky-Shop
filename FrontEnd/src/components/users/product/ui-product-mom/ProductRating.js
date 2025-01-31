import React, { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import axios from "axios";
import "./ProductRating.css";
import Notification from "./Notification"; // Import the Notification component
import Loading from "../../../layout/Loading";
import PropTypes from 'prop-types'; // Import PropTypes
import config from "../../../config/config";
import { useTranslation } from 'react-i18next';

export default function ProductRating({ productID, userID, fetchComments, setRatingCount }) {
    const [number, setNumber] = useState(0);
    const [hoverStar, setHoverStar] = useState(undefined);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null); // State for notification
    const { t } = useTranslation();

    const handleText = () => {
        switch (number || hoverStar) {
            case 0:
                return `${t('veryBad')}`;
            case 1:
                return `${t('bad')}`;
            case 2:
                return `${t('poorProduct')}`;
            case 3:
                return `${t('good')}`;
            case 4:
                return `${t('pretty good')}`;
            case 5:
                return `${t('great')}`;
            default:
                return `${t('rate')}`;
        }
    };

    const handlePlaceHolder = () => {
        switch (number || hoverStar) {
            case 0:
                return `${t('comment')}`;
            case 1:
            case 2:
                return `${t('doYouHaveAnyProblemsWithTheProduct?')}`;
            case 3:
            case 4:
                return `${t('howDoYouFeelAboutTheProduct?')}`;
            case 5:
                return `${t('whyYouLiktIt')}`;
            default:
                return `${t('comment')}`;
        }
    };

    const handleSubmit = async () => {
        if (number > 0 && description) {
            setIsSubmitting(true);
            try {
                await axios.post(`${config.API_ROOT}/api/v1/comment/userComment`, {
                    UserID: userID,
                    ProductID: productID,
                    Rating: parseInt(number),
                    Description: description,
                });
                setIsSubmitting(false);
                setNotification(`${t('commentSuscessfully')}`);
                setNumber(0);
                setDescription("");
                fetchComments();
                setRatingCount(prevCount => prevCount - 1);
            } catch (error) {
                console.error("Error submitting review:", error);
                setIsSubmitting(false);
            }
        }
    };

    const clearNotification = () => {
        setNotification(null);
    };

    return (
        <div className="ProductRating-thinh-rt">
            {notification && <Notification message={notification} clearNotification={clearNotification} time={2000} />}
            <div className="content-thinh-rt">
                <div>
                    <h1>{handleText()}</h1>
                    {Array(5)
                        .fill()
                        .map((_, index) =>
                            number >= index + 1 || hoverStar >= index + 1 ? (
                                <AiFillStar
                                    key={index}
                                    onMouseOver={() => !number && setHoverStar(index + 1)}
                                    onMouseLeave={() => setHoverStar(undefined)}
                                    style={{ color: "orange" }}
                                    onClick={() => setNumber(index + 1)}
                                />
                            ) : (
                                <AiOutlineStar
                                    key={index}
                                    onMouseOver={() => !number && setHoverStar(index + 1)}
                                    onMouseLeave={() => setHoverStar(undefined)}
                                    style={{ color: "orange" }}
                                    onClick={() => setNumber(index + 1)}
                                />
                            )
                        )}
                </div>
                <textarea
                    placeholder={handlePlaceHolder()}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <button
                    className={`submit-btn-thinh-rt ${!number ? "disabled" : ""}`}
                    onClick={handleSubmit}
                    disabled={!number || isSubmitting}
                >
                   {isSubmitting ? <Loading /> : t('send')}
                </button>
            </div>
        </div>
    );
}

// Prop types definition
ProductRating.propTypes = {
    productID: PropTypes.string.isRequired,
    userID: PropTypes.string.isRequired,
    fetchComments: PropTypes.func.isRequired,
    setRatingCount: PropTypes.func.isRequired,
};
