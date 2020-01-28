<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use http\Exception;

use \Pusher\Pusher;
use Pusher\PusherException;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function  authenticate(Request $request){
        $socketId = $request->socket_id;
        $chanelName = $request->channel_name;

        $pusher = new Pusher('0f023d4e29ea60055ea7','a1c2f050618ac881dac3','909902', [
            'cluster' => 'eu',
            'encrypted' => true
        ]);

        $presence_data =['name' => auth()->user()->name, 'lon' => auth()->user()->lon,'lat' => auth()->user()->lat ];
        try {
            $key = $pusher->presence_auth($chanelName, $socketId, auth()->id(), $presence_data);
        } catch (PusherException $e) {
        }
        return response($key);
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
    }
}
