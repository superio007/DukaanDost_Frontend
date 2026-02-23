import { ArrowRight, Eye, Lock, Mail, GitGraph, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import type { SigninForm } from "../../types/authTypes";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
const signin = async (payload: SigninForm) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/auth/login`,
    payload,
  );
  return res?.data?.data;
};
const SigninPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninForm>();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (data: SigninForm) => {
    setApiError(""); // reset previous error
    setIsSubmitting(true);

    try {
      const result = await signin({
        email: data.email,
        password: data.password,
      });

      console.log("Login Success:", result);
      useAuthStore.getState().setAuth(result.user, result.token);
      navigate("/");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Login failed. Please try again.";

      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* LEFT SIDE unchanged */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1c6bf2] overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <img
            alt="Abstract blue textile pattern"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            data-alt="Abstract blue industrial textile weaving pattern"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk9FQDc_JDB6hFbzvMRWE779ENqMU-ZG48P4Q1-wcknHV7TqKlLzoGplf5Eqob9XBW7XIzGDAWmOqJ4nwtI77Svl6pErcL6-zE7-iYu7BLGv65QspIXFps3jYNgO1kQq-dcXCMJf1Uf9Jc_BzjW3wVx82rY4KOe62qxjSOXzikD005KKG2j8uyaPSmSs6VUKzxZ3RGeG8fX-YNKVD9t354NCLrkXDZgkJYZyk_chdPEhiN0BSx_QQQEs8oLTC5lyX7mzyaMdAFceM"
          />
          <div className="absolute inset-0 bg-linear-to-br from-[#1c6bf2] via-[#1c6bf2]/80 to-blue-900/90"></div>
        </div>
        <div className="relative z-10 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="size-10 bg-white rounded-lg flex items-center justify-center text-[#1c6bf2] shadow-lg">
              <GitGraph size={18} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Fabric ERP</h1>
          </div>
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Intelligent Resource Planning htmlFor Modern Textiles
          </h2>
          <p className="text-xl text-white/80 leading-relaxed mb-8">
            Streamline your supply chain, optimize production cycles, and manage
            resources in one unified, intelligent plathtmlForm designed htmlFor
            the fabric industry.
          </p>
          <div className="flex gap-4">
            <div className="flex -space-x-2">
              <img
                alt="User avatar"
                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#1c6bf2] bg-slate-200"
                data-alt="Portrait of a professional male user"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmDri12Ifzk9OmByOnQ_phs8K84AAgC_V2QAe-i-4O5nppq0JEqObrw0fpRWCi0LrFMEOYdIOfZqz1w46dYXgr9g2Ig3ZHzDBOtiEd0-dmkCalLP9_MVXXIgISyy5JeqnIyogkdHGqg1BFnvwdml_LIvPwoIUkAA4GxI5dMBHVMz4mvnReO1-IcQuPXNgYBHVMAn1HJQNfmpeVgb7iJ_UuMbTMTQDLjUeX1ezt_ma9nCo7t1NcSnycYxD2rOpIFZCe-CK8P55t2RI"
              />
              <img
                alt="User avatar"
                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#1c6bf2] bg-slate-200"
                data-alt="Portrait of a professional female user"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzhEyK8Mr1ymido8q4TMpb6MmnWFyDnrHnpdTXcmHZRI_zZRmAQmYLpyRs5fNgKWZgVJbxXFytnlofj5F3grqaEkLIbvc88sD951syP9UzpdNZaNJ-GDTSDTH8ClLekp1iq9Fh01QjWQrMG4NH4Nvt5zfCamJUNmRzKET_PpX960iS2iZruGz59HOm9cbmRaDPtwo6dfO2rAYlW__zsoyR_h3zqLX5zW1zJHFJVUo52yhdONJ_vzPKGCFn0KqLpYtjf5dTQd_jkXQ"
              />
              <img
                alt="User avatar"
                className="inline-block h-10 w-10 rounded-full ring-2 ring-[#1c6bf2] bg-slate-200"
                data-alt="Portrait of a professional female user"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfvwJaoCGdVIvJ9Pj5GFcVQju48wvi0ZsOb-puMQUJkFbkaOQi3WxYT01s2ytlANEGQvybT0xvS9USuEaZw71F1vcyp9D8z42jSjH6A74L1xpqpdwr-eor7YOdPLdpJLNURkrNuhvnNw5vAmQZJxitEmCAooxIOuSUskOVfLtTTa9gpWMtcySscZfVh1ABGKLSeZqLjL2Eb-kZk1uoPvTDDldM_codwK5ZSlvi7sc-J6wTmPlx20Ji59ImX43mToH_avSVS08Lntw"
              />
            </div>
            <div className="text-sm font-medium">
              <p>Joined by 500+ textile leaders</p>
              <p className="text-white/60">Trusting Fabric ERP daily</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-12 self-start">
            <span className="bg-[#1c6bf2] text-white rounded p-2">
              <GitGraph size={18} />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 ">
              Fabric ERP
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome Back
            </h3>
            <p className="text-slate-500 mt-2">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* EMAIL */}
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-slate-700 ml-1"
                htmlFor="email"
              >
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>

                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all placeholder:text-slate-400 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : "border-slate-200 focus:ring-[#1c6bf2]/20 focus:border-[#1c6bf2]"
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
              </div>

              {errors.email && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-slate-700 ml-1"
                htmlFor="password"
              >
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all placeholder:text-slate-400 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-slate-200 focus:ring-[#1c6bf2]/20 focus:border-[#1c6bf2]"
                  }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters required",
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 hover:cursor-pointer hover:opacity-90 flex items-center text-slate-400 hover:text-[#1c6bf2]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-500 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* REMEMBER */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#1c6bf2] border-slate-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-600"
                >
                  Remember me
                </label>
              </div>

              <a href="#" className="text-sm font-semibold text-[#1c6bf2]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center hover:cursor-pointer hover:opacity-90 items-center gap-2 py-4 rounded-xl font-bold text-white bg-[#1c6bf2] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
            {apiError && (
              <p className="text-sm text-red-500 text-center mt-2">
                {apiError}
              </p>
            )}
          </form>

          <div className="text-sm text-center">
            Already have account{" "}
            <Link to={"/auth/signup"} className="text-[#1c6bf2]">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
