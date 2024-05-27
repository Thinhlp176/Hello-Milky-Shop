import React from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBIcon,
} from "mdb-react-ui-kit";

function Login() {
  return (
    <MDBContainer fluid>
      <MDBRow className="d-flex justify-content-center align-items-center h-100">
        <MDBCol col="12">
          <MDBCard
            className="bg-light text-dark my-5 mx-auto"
            style={{ borderRadius: "1rem", maxWidth: "500px" }}
          >
            <MDBCardBody className="p-5 d-flex flex-column align-items-center mx-auto w-100">
              <h2 className="fw-bold mb-2 text-uppercase">Đăng nhập</h2>
              <p className="text-dark-50 mb-5">
                Please enter your login and password!
              </p>

              <MDBInput
                wrapperClass="mb-4 mx-5 w-100"
                labelClass="text-dark"
                placeholder="Số điện thoại"
                id="formControlLg"
                type="tel"
                size="lg"
              />
              <MDBInput
                wrapperClass="mb-4 mx-5 w-100"
                labelClass="text-dark"
                placeholder="Mật Khẩu"
                id="formControlLg"
                type="password"
                size="lg"
              />

              <p className="small mb-3 pb-lg-2">
                <a className="text-dark-50" href="#!">
                  Quên mật khẩu?
                </a>
              </p>
              <button className="login-button" type="button">
                <span className="button-text">Đăng nhập</span>
              </button>

              <div className="d-flex flex-row mt-3 mb-5">
                <a href="#" className="google-signup-button m-3">
                  <MDBIcon
                    fab
                    icon="google"
                    size="lg"
                    className="google-icon"
                  />
                  <span className="button-text">Đăng kí với Google</span>
                </a>
              </div>

              <div>
                <p className="mb-0">
                  Bạn chưa có tài khoản?{" "}
                  <Link to="/Signup" className="text-dark-50 fw-bold">
                    Đăng kí ngay
                  </Link>
                </p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;