import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getCartItemsFromLocalStorageAction } from '../../../redux/slices/cart/cartSlices';
import { placeOrderAction } from '../../../redux/slices/orders/ordersSlices';
import { getUserProfileAction } from '../../../redux/slices/users/usersSlice';
import ErrorMsg from '../../ErrorMsg/ErrorMsg';
import LoadingComponent from '../../LoadingComp/LoadingComponent';
import AddShippingAddress from '../Forms/AddShippingAddress';
import { resetSuccessAction } from '../../../redux/slices/globalActions/globalActions'; // Import resetSuccessAction

export default function OrderPayment() {
  // Get data from location
  const location = useLocation();
  const { sumTotalPrice } = location.state;

  // Dispatch
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCartItemsFromLocalStorageAction());
  }, [dispatch]);

  // Get cart items from store
  const { cartItems } = useSelector((state) => state?.carts);

  // User profile
  useEffect(() => {
    dispatch(getUserProfileAction());
  }, [dispatch]);
  const { loading: userLoading, error: userError, profile } = useSelector((state) => state?.users);
  const user = profile?.user;

  // Place order handler
  const placeOrderHandler = () => {
    dispatch(
      placeOrderAction({
        shippingAddress: user?.shippingAddress,
        orderItems: cartItems,
        totalPrice: sumTotalPrice,
      })
    );
  };

  // Get order state
  const { loading: orderLoading, error: orderError, qrCodeUrl } = useSelector(
    (state) => state?.orders
  );

  // Close QR modal
  const closeQrModal = () => {
    dispatch(resetSuccessAction()); // Dispatch resetSuccessAction to clear qrCodeUrl and isAdded
  };

  return (
    <>
      {userError && <ErrorMsg message={userError?.message} />}
      {orderError && <ErrorMsg message={orderError?.message} />}
      <div className="bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h1 className="sr-only">Checkout</h1>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
              <div>
                <div className="mt-10 border-t border-gray-200 pt-10">
                  {/* Shipping Address */}
                  <AddShippingAddress />
                </div>
              </div>

              {/* Order summary */}
              <div className="mt-10 lg:mt-0">
                <h2 className="text-lg font-medium text-gray-900">
                  Order summary
                </h2>

                <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <h3 className="sr-only">Items in your cart</h3>
                  <ul role="list" className="divide-y divide-gray-200">
                    {cartItems?.map((product) => (
                      <li key={product._id} className="flex py-6 px-4 sm:px-6">
                        <div className="flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product._id}
                            className="w-20 rounded-md"
                          />
                        </div>

                        <div className="ml-6 flex flex-1 flex-col">
                          <div className="flex">
                            <div className="min-w-0 flex-1">
                              <p className="mt-1 text-sm text-gray-500">
                                {product.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {product.size}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {product.color}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-1 items-end justify-between pt-2">
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              $ {product?.price} X {product?.qty} =$
                              {product?.totalPrice}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <dl className="space-y-6 border-t border-gray-200 py-6 px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm">Taxes</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        $0.00
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                      <dt className="text-base font-medium">Sub Total</dt>
                      <dd className="text-base font-medium text-gray-900">
                        $ {sumTotalPrice}.00
                      </dd>
                    </div>
                  </dl>

                  <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                    {orderLoading || userLoading ? (
                      <LoadingComponent />
                    ) : (
                      <button
                        onClick={placeOrderHandler}
                        className="w-full rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                      >
                        Confirm Payment - ${sumTotalPrice}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* QR Code Modal */}
      {qrCodeUrl && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Scan QR Code to Pay
            </h2>
            <img
              src={qrCodeUrl}
              alt="Payment QR Code"
              className="w-full max-w-xs mx-auto"
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeQrModal}
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}