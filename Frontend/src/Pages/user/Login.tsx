import {Link , useNavigate} from 'react-router-dom';
import {useState} from 'react';
import { axiosInstance } from '../../api/axiosInstance';
import { toast , Toaster} from 'react-hot-toast';
import { useDispatch , useSelector } from 'react-redux';
import { setUserInfo } from '../../Redux/slices/slice';


const Login = () => {
  const [email , setEmail] = useState<string>('');
  const [password , setPassword] = useState<string>('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axiosInstance.post('/auth/login' , {email , password}).then((res) => {
      if(res.data.userTokenData){
        
        dispatch(setUserInfo(res.data.userTokenData));
        toast.success(res.data.message , {duration : 2000 , style : {color : '#fff' , background : 'black'}});
        setTimeout(() => {
          navigate('/profile');
        }, 3000);

      } else if(res.data.companyTokenData){

        dispatch(setUserInfo(res.data.companyTokenData));
        toast.success(res.data.message , {duration : 2000 , style : {color : '#fff' , background : 'black'}});
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      }

      if(res.data.error){
        toast.error(res.data.error , {duration : 2000 , style : {color : '#fff' , background : 'black'}});
      }
    }).then((error) => console.log(error ,'axios catch error while login')
    )
  }

  return (
    <>
    <Toaster position='top-right'/>
    <div className=" border-solid flex min-h-full flex-1 flex-col justify-center px-6 py-12 laptop:px-8">
        <div className="mobile:mx-auto mobile:w-full mobile:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="public/Cropped1-Logo.png"
            alt="Logo"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Login to your account
          </h2>
        </div>

        <div className="border-2 rounded-md border-violet-950 p-5 bg-gray-50 mt-10 mobile:mx-auto mobile:w-full mobile:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit} method="POST">

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  value={email}
                  name="email"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                {/* <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div> */}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  value={password}
                  name="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-light-blue-900 hover:bg-light-blue-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Login
              </button>
            </div>

            <p className='lg:text-lg font-semibold text-center py-1 dark:text-black'>OR</p>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Continue With Google
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Do not have an Account?
            <Link to='/register' className="font-semibold leading-6 text-violet-900 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
    </div>
    </>
  )
}

export default Login