@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header color-white bg-own">{{ __('Register') }}</div>

                <div class="card-body">
                    <form method="POST" action="{{ route('register') }}">
                        @csrf

                        <div class="form-group row">
                            <label for="name" class="col-md-4 col-form-label text-md-right">{{ __('Name') }}</label>

                            <div class="col-md-6">
                                <input id="name" type="text" class="form-control @error('name') is-invalid @enderror" name="name" value="{{ old('name') }}" required autocomplete="name" autofocus>

                                @error('name')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="email" class="col-md-4 col-form-label text-md-right">{{ __('E-Mail Address') }}</label>

                            <div class="col-md-6">
                                <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email">

                                @error('email')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="password" class="col-md-4 col-form-label text-md-right">{{ __('Password') }}</label>

                            <div class="col-md-6">
                                <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="new-password">

                                @error('password')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="form-group row">
                            <label for="password-confirm" class="col-md-4 col-form-label text-md-right">{{ __('Confirm Password') }}</label>

                            <div class="col-md-6">
                                <input id="password-confirm" type="password" class="form-control" name="password_confirmation" required autocomplete="new-password">
                            </div>
                        </div>
                        <div class="form-group row">
                            <div class="col-md-6">
                                <input id="lon" type="hidden" class="form-control @error('lon') is-invalid @enderror" name="lon" required autocomplete="lon">
                                <input id="lat" type="hidden" class="form-control @error('lat') is-invalid @enderror"  name="lat" required autocomplete="lat">
                                @error('lon')
                                <span class="invalid-feedback" role="alert">
                                            <strong>Put your marker on the map !</strong>
                                        </span>
                                @enderror
                            </div>
                        </div>
                        <div class="form-group row">

                                <label for="lon-confirm" class="col-md-4 col-form-label text-md-right">Put marker on Your localization </label>

                            <div class="col-md-6">
                                <div id="map"></div>
                            </div>
                        </div>
                        <div class="form-group row mb-0">
                            <div class="col-md-6 offset-md-4">
                                <button type="submit" class="btn btn-primary">
                                    {{ __('Register') }}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
    <script>
        function initMap() {
            // The location of Uluru
            var uluru = {lat: 52.344, lng: 21.036};
            // The map, centered at Uluru
            var map = new google.maps.Map(
                document.getElementById('map'), {zoom: 5, center: uluru});

                document.getElementById('map').style.width = "100%";
                document.getElementById('map').style.height = "300px";
            var marker = null;
            google.maps.event.addListener(map, 'click', function( event ){
                document.getElementById('lat').value = event.latLng.lat();
                document.getElementById('lon').value = event.latLng.lng();

                var myLatlng = new google.maps.LatLng( document.getElementById('lat').value, document.getElementById('lon').value);
                if(marker)  marker.setMap(null);
                 marker = new google.maps.Marker({
                    position:  myLatlng,
                    map: map,
                    title: 'Hello World!'
                });
                marker.setMap(map);
            });




            // The marker, positioned at Uluru
           // var marker = new google.maps.Marker({position: uluru, map: map});
        }
    </script>
<script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAB95LZStzteB97sZCf9aONzumILVPGwHE&callback=initMap">
</script>
@endsection
