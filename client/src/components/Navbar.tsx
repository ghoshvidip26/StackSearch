import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slice";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 px-8 py-3 flex items-center justify-between">
      {/* LEFT — logo */}
      <div className="flex items-center gap-3">
        <img
          src="/StackSearch.png"
          alt="StackSearch logo"
          className="w-7 h-7"
        />
        <h1 className="text-xl font-semibold text-[#8B8DFF]">StackSearch</h1>
      </div>

      {user.user && (
        <div className="flex items-center gap-3">
          <img
            src={user.user?.photo}
            alt="user avatar"
            className="w-9 h-9 rounded-full border border-slate-700"
          />

          <button
            onClick={() => dispatch(logout())}
            className="px-3 py-1 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
