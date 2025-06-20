import axios from "axios";
import { act } from "react-dom/test-utils";
import baseURL from "../../../utils/baseURL";
import {
  resetErrAction,
  resetSuccessAction,
} from "../globalActions/globalActions";
const { createAsyncThunk, createSlice } = require("@reduxjs/toolkit");


//initalsState
const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  isAdded: false,
  isUpdated: false,
  isDeleted: false,
  stats: null,
};

//create product action
// Create order action
export const placeOrderAction = createAsyncThunk(
  'order/place-order',
  async (payload, { rejectWithValue, getState, dispatch }) => {
    try {
      const { orderItems, shippingAddress, totalPrice } = payload;
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Place order
      const { data: orderData } = await axios.post(
        `${baseURL}/orders`,
        {
          orderItems,
          shippingAddress,
          totalPrice,
        },
        config
      );

      // Extract orderId and orderNumber
      console.log("orderData",orderData)
      const { _id: orderId, orderNumber } = orderData;

      // Call VietQR API to generate QR code
      const { data: qrData } = await axios.post(
        `${baseURL}/payments/qr`,
        {
          orderId,
          orderNumber,
          amount: totalPrice,
          currency: 'VND',
        },
        config
      );

      return {
        order: orderData,
        qrCodeUrl: qrData.qrCodeUrl,
      };
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: 'Failed to place order or generate QR code' });
    }
  }
);
//fetch products action
export const fetchOrdersAction = createAsyncThunk(
  "orders/list",
  async ({ url }, { rejectWithValue, getState, dispatch }) => {
    console.log(url);
    try {
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(`${baseURL}/orders`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);



//fetch pdf action
export const getPDF = createAsyncThunk(
  "product/details",
  async (orderID, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      };

      const { data } = await axios.get(
        `${baseURL}/orders/invoicePDF/${orderID}`,
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);


//Get orders stats
export const OrdersStatsAction = createAsyncThunk(
  "orders/statistics",
  async (payload, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(`${baseURL}/orders/sales/stats`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);
// Clear QR code action
export const clearQRCodeAction = createAsyncThunk(
  'orders/clear-qr',
  async (_, { rejectWithValue }) => {
    try {
      return null; // Simply return null to clear qrCodeUrl
    } catch (error) {
      return rejectWithValue(error?.message);
    }
  }
);


//fetch product action
export const fetchOderAction = createAsyncThunk(
  "orders/details",
  async (productId, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        `${baseURL}/orders/${productId}`,
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

//Update order
export const updateOrderAction = createAsyncThunk(
  "order/update-order",
  async (payload, { rejectWithValue, getState, dispatch }) => {
    try {
      const { status, id } = payload;
      //token
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      //request
      const { data } = await axios.put(
        `${baseURL}/pm/updateOrder/${id}`,
        {
          status,
        },
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

// cancel order action
export const cancelOrderAction = createAsyncThunk(
  "orders/cancel",
  async ( { id }, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.delete(`${baseURL}/orders/${id}/cancel`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);


// fetch order stats action
export const fetchOrderStats = createAsyncThunk(
  "orders/stats",
  async ( { startDate, endDate }, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(`${baseURL}/sm/stats?startDate=${startDate}&endDate=${endDate}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  },
);


//slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  extraReducers: (builder) => {
    //create
     builder.addCase(placeOrderAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(placeOrderAction.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload.order;
      state.qrCodeUrl = action.payload.qrCodeUrl; // Store QR code URL
      state.isAdded = true;
    });
    builder.addCase(placeOrderAction.rejected, (state, action) => {
      state.loading = false;
      state.order = null;
      state.qrCodeUrl = null; // Reset QR code URL on error
      state.isAdded = false;
      state.error = action.payload;
    });
    //fetch all
    builder.addCase(fetchOrdersAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOrdersAction.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchOrdersAction.rejected, (state, action) => {
      state.loading = false;
      state.orders = null;
      state.error = action.payload;
    });
    builder.addCase(clearQRCodeAction.fulfilled, (state) => {
      state.qrCodeUrl = null;
      state.isAdded = false;
    });
    //stats
    builder.addCase(OrdersStatsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(OrdersStatsAction.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    });
    builder.addCase(OrdersStatsAction.rejected, (state, action) => {
      state.loading = false;
      state.stats = null;
      state.error = action.payload;
    });
    //stats
    builder.addCase(updateOrderAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateOrderAction.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload;
    });
    builder.addCase(updateOrderAction.rejected, (state, action) => {
      state.loading = false;
      state.order = null;
      state.error = action.payload;
    });
    //fetch single
    builder.addCase(fetchOderAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOderAction.fulfilled, (state, action) => {
      state.loading = false;
      state.order = action.payload;
    });
    builder.addCase(fetchOderAction.rejected, (state, action) => {
      state.loading = false;
      state.order = null;
      state.error = action.payload;
    });
    // cancel order action
    builder.addCase(cancelOrderAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(cancelOrderAction.fulfilled, (state, action) => {
      state.loading = false;
      state.isDeleted = true;
    });
    builder.addCase(cancelOrderAction.rejected, (state, action) => {
      state.loading = false;
      state.isDeleted = false;
      state.error = action.payload;
    });
    // fetch order stats action
    builder.addCase(fetchOrderStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOrderStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchOrderStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    //reset error
    builder.addCase(resetErrAction.pending, (state, action) => {
      state.error = null;
      state.isDeleted = false;
    });
    //reset success
     builder.addCase(resetSuccessAction.pending, (state) => {
      state.isAdded = false;
      state.isDeleted = false;
      state.qrCodeUrl = null; // Clear QR code URL
    });
  },
});

//generate the reducer
const ordersReducer = ordersSlice.reducer;

export default ordersReducer;
