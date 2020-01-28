<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">

        <!-- Styles -->
        <style>
            html, body {
                background-color: #f8fafc;;
                color: #636b6f;
                font-family: 'Nunito', sans-serif;
                font-weight: 200;
                height: 100vh;
                margin: 0;
            }

            .full-height {
                height: 100vh;
            }

            .flex-center {
                align-items: center;
                display: flex;
                justify-content: center;
            }

            .position-ref {
                position: relative;
            }

            .top-right {
                background: #eb4034;
                position: absolute;
                right: 0px;
                top: 0px;
                width: 100%;
                display: flex;
                justify-content: flex-end;
                padding: 20px 0;
            }

            .content {
                text-align: center;
            }

            .title {
                font-size: 84px;
            }

            .links > a {
                color: #fff;
                padding: 0 25px;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: .1rem;
                text-decoration: none;
                text-transform: uppercase;
            }

            .m-b-md {
                margin-bottom: 30px;
                color:#eb4034;
            }
            .main-content h1{
                font-size: 42px;
                text-transform: uppercase;
            }
            .main-content p{
                font-size: 21px;
            }
            .main-content{
                max-width: 80%;
                margin: 0 auto;
            }

        </style>
    </head>
    <body>
        <div class="flex-center position-ref full-height">
            @if (Route::has('login'))
                <div class="top-right links">
                    @auth
                        <a href="{{ url('/home') }}">Home</a>
                    @else
                        <a href="{{ route('login') }}">Login</a>

                        @if (Route::has('register'))
                            <a href="{{ route('register') }}">Register</a>
                        @endif
                    @endauth
                </div>
            @endif

            <div class="content">
                <div class="title m-b-md">
                    <div class="main-content">
                     <h1>Video chat</h1>
                      <p>A web application that allows to communicate between users in real time. Video chat has been successfully completed with the use of latest programming libraries and tools. The advantages of the application are an attractive graphic interface, effective and fast real-time communication, as well as protection of usage. Basic tests were carried out for the project, which made it possible to improve the website's appearance and the intuitiveness of using the created application</p>
                    </div>
                </div>


            </div>
        </div>
    </body>
</html>
