@extends('layouts.admin')

@section('title', $pageTitle)

@section('content')
<div class="bg-white border border-slate-200 shadow-sm">
    <div class="px-5 pt-4 pb-3 border-b border-slate-200">
        <h2 class="font-normal text-slate-700 uppercase text-sm tracking-wide">{{ $pageTitle }}</h2>
    </div>

    <div class="flex flex-col items-center justify-center text-center px-6 py-20">
        <div class="w-14 h-14 rounded-full flex items-center justify-center mb-4" style="background-color:#fff4ec;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="#F26522" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" /></svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-800">{{ $pageTitle }}</h3>
        <p class="text-sm text-slate-500 mt-1 max-w-md">{{ $desc }}</p>
        <span class="mt-4 text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">En cours de construction</span>
    </div>
</div>
@endsection
