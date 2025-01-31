import React, { useState, useEffect } from "react";
import "./Confirm.css";
import { Modal, Button, message, Input } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import ThrowPage from "../../users/product/ui-list-product-mom/ThrowPage";
import { useSelector } from "react-redux";
import { getUserIdFromToken } from "../../store/actions/authAction";
import config from "../../config/config";
import { AES, enc } from 'crypto-js';

function Confirm() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderID, setSelectedOrderID] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [shippingAddress, setShippingAddress] = useState(null);
  const ordersPerPage = 10;
  const { token } = useSelector((state) => state.auth);
  const decryptedToken = token ? AES.decrypt(token, config.SECRET_KEY).toString(enc.Utf8) : null;
  const userId = getUserIdFromToken(decryptedToken);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${config.API_ROOT}/api/v1/order/getOrdersByStatusOrderID/1`
      );
      const data = await response.json();
      setOrders(data.address);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const editOrder = (orderID) => {
    Modal.confirm({
      title: "Xác nhận thay đổi trạng thái đơn hàng",
      content: "Bạn có chắc muốn thay đổi trạng thái đơn hàng này không?",
      onOk: () => {
        fetch(
          `${config.API_ROOT}/api/v1/order/updateStatusOrderID/${orderID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ statusOrderID: 2 }),
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.OrderID === orderID
                  ? {
                    ...order,
                    StatusOrderID: [2, 2],
                    StatusOrderName: "Đã xác nhận",
                  }
                  : order
              )
            );

            message.success("Trạng thái đơn hàng đã được cập nhật.");
            fetchOrders();
          })
          .catch((error) => {
            message.error(
              `Có lỗi xảy ra khi cập nhật trạng thái đơn hàng: ${error.message}`
            );
          });
      },
    });
  };

  const cancelOrder = (orderID) => {
    setSelectedOrderID(orderID);
    setIsCancelModalVisible(true);
  };

  const handleCancelModalOk = () => {
    fetch(`${config.API_ROOT}/api/v1/order/cancelOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: selectedOrderID,
        reasonCancelContent: cancelReason || "Hủy bởi nhân viên",
        userID: userId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        fetchOrders();
        return response.json();
      })
      .then((data) => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.OrderID !== selectedOrder)
        );
        message.success("Đơn hàng đã được hủy.");
        setIsCancelModalVisible(false);
        setCancelReason("");
        setSelectedOrder(null);
      })
      .catch((error) => {
        message.error(`Có lỗi xảy ra khi hủy đơn hàng: ${error.message}`);
      });
  };

  const handleCancelModalCancel = () => {
    setIsCancelModalVisible(false);
    setCancelReason("");
    setSelectedOrder(null);
  };

  const fetchOrderDetails = async (orderID) => {
    try {
      const response = await fetch(
        `${config.API_ROOT}/api/v1/order/getOrderDetailByOrderID/${orderID}`
      );
      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error("Error fetching order details:", error);
      return [];
    }
  };

  const fetchShippingAddress = async (orderID) => {
    try {
      const response = await fetch(
        `${config.API_ROOT}/api/v1/shippingAddress/getInfoShippingByOrderID/${orderID}`
      );
      const data = await response.json();
      setShippingAddress(data);
    } catch (error) {
      console.error("Error fetching shipping address:", error);
      setShippingAddress(null);
    }
  };

  const viewOrderDetails = async (order) => {
    const orderDetails = await fetchOrderDetails(order.OrderID);
    setSelectedOrder({ ...order, details: orderDetails });
    await fetchShippingAddress(order.OrderID);
    setIsDetailModalVisible(true);
  };

  const handleModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedOrder(null);
    setShippingAddress(null);
  };

  const formatPrice = (price) => {
    return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    const sortedOrders = [...orders].sort((a, b) => {
      if (key === "OrderID") {
        return direction === "ascending"
          ? a.OrderID - b.OrderID
          : b.OrderID - a.OrderID;
      } else if (key === "OrderDate") {
        return direction === "ascending"
          ? new Date(a.OrderDate) - new Date(b.OrderDate)
          : new Date(b.OrderDate) - new Date(a.OrderDate);
      } else if (key === "TotalAmount") {
        return direction === "ascending"
          ? a.TotalAmount - b.TotalAmount
          : b.TotalAmount - a.TotalAmount;
      }
      return 0;
    });

    setOrders(sortedOrders);
    setSortConfig({ key, direction });
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortConfig.key === "OrderID") {
      return sortConfig.direction === "ascending"
        ? a.OrderID - b.OrderID
        : b.OrderID - a.OrderID;
    } else if (sortConfig.key === "OrderDate") {
      return sortConfig.direction === "ascending"
        ? new Date(a.OrderDate) - new Date(b.OrderDate)
        : new Date(b.OrderDate) - new Date(a.OrderDate);
    } else if (sortConfig.key === "TotalAmount") {
      return sortConfig.direction === "ascending"
        ? a.TotalAmount - b.TotalAmount
        : b.TotalAmount - a.TotalAmount;
    }
    return 0;
  });

  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="confirm-container">
      <table>
        <thead>
          <tr className="row">
            <th
              className={`promo-th col-md-2 ${sortConfig.key === "OrderID" ? sortConfig.direction : ""
                }`}
              onClick={() => handleSort("OrderID")}
            >
              Mã đơn hàng
              <button className={`sort-icon-order `}>
                <FontAwesomeIcon icon={faSort} />
              </button>
            </th>
            <th
              className={`promo-th col-md-2 ${sortConfig.key === "OrderDate" ? sortConfig.direction : ""
                }`}
              onClick={() => handleSort("OrderDate")}
            >
              Ngày đặt hàng
              <button className={`sort-icon-order`}>
                <FontAwesomeIcon icon={faSort} />
              </button>
            </th>
            <th
              className={`promo-th col-md-2 ${sortConfig.key === "TotalAmount" ? sortConfig.direction : ""
                }`}
              onClick={() => handleSort("TotalAmount")}
            >
              Tổng
              <button className={`sort-icon-order`}>
                <FontAwesomeIcon icon={faSort} />
              </button>
            </th>
            <th className="promo-th col-md-3">Địa chỉ</th>
            <th className="promo-th col-md-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr className="row" key={order.OrderID}>
              <td className="col-md-2">{order.OrderID}</td>
              <td className="col-md-2">
                {new Date(order.OrderDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>
              <td className="col-md-2">
                {formatPrice(parseInt(order.TotalAmount))}
              </td>
              <td className="col-md-3">{order.Address}</td>
              <td className="col-md-3 nut-xndh">
                <button
                  type="button"
                  className="btn btn-warning xndh"
                  onClick={() => editOrder(order.OrderID)}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  className="btn btn-primary xndh"
                  onClick={() => viewOrderDetails(order)}
                >
                  Thông tin
                </button>
                <button
                  type="button"
                  className="btn btn-danger xndh"
                  onClick={() => cancelOrder(order.OrderID)}
                >
                  Hủy đơn
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-container-thinhvcher throw-page-confirm">
        <ThrowPage
          current={currentPage}
          onChange={handlePageChange}
          total={sortedOrders.length}
          productsPerPage={10}
        />
      </div>

      <Modal
        title="Thông tin chi tiết đơn hàng"
        visible={isDetailModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div className="modal-content-scrollable-thinhh">
            <div className="ttdh-thinh">
              <h2>Thông tin đơn hàng</h2>
              <table className="table-info-order">
                <tbody>
                  <tr>
                    <td className="mdh">
                      <strong>Mã đơn hàng:</strong>
                    </td>
                    <td>{selectedOrder.OrderID}</td>
                  </tr>
                  <tr>
                    <td className="mdh">
                      <strong>Ngày đặt hàng:</strong>
                    </td>
                    <td>
                      {new Date(selectedOrder.OrderDate).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="mdh">
                      <strong>Tổng:</strong>
                    </td>
                    <td>{formatPrice(selectedOrder.TotalAmount)}</td>
                  </tr>
                  {shippingAddress && (
                    <>
                      <tr>
                        <td className="mdh">
                          <strong>Người nhận:</strong>
                        </td>
                        <td>{shippingAddress[0].Receiver}</td>
                      </tr>
                      <tr>
                        <td className="mdh">
                          <strong>Số điện thoại:</strong>
                        </td>
                        <td>{shippingAddress[0].PhoneNumber}</td>
                      </tr>
                      <tr>
                        <td className="mdh">
                          <strong>Địa chỉ:</strong>
                        </td>
                        <td>{shippingAddress[0].Address}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
              <table className="table-products-order">
                <thead>
                  <tr>
                    <th>Mã sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Hình ảnh</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.details.map((detail) => (
                    <tr key={detail.ProductID}>
                      <td>{detail.ProductID}</td>
                      <td>{detail.ProductName}</td>
                      <td>
                        <img
                          src={detail.Image}
                          alt={detail.ProductName}
                          width="50"
                        />
                      </td>
                      <td>{detail.Quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Lý do hủy đơn hàng"
        visible={isCancelModalVisible}
        onOk={handleCancelModalOk}
        onCancel={handleCancelModalCancel}
      >
        <Input.TextArea
          placeholder="Nhập lý do hủy đơn hàng"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default Confirm;
