<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="tempDefault.aspx.cs" Inherits="ClientWebApplication._Default" %>

<asp:Content runat="server" ID="FeaturedContent" ContentPlaceHolderID="FeaturedContent">
    </asp:Content>
<asp:Content runat="server" ID="BodyContent" ContentPlaceHolderID="MainContent">
    <h3>Here is content to public:</h3>
    <ol class="round">
        <li class="one">
            <h5>Getting Started</h5>
            ASP.NET Web Forms lets you build dynamic websites using a familiar drag-and-drop, event-driven model.
            A design surface and hundreds of controls and components let you rapidly build sophisticated, powerful UI-driven sites with data access.
            <a href="http://go.microsoft.com/fwlink/?LinkId=245146">Learn more…</a>
        </li>
        <li class="two">
            <h5>Add NuGet packages and jump-start your coding</h5>
            NuGet makes it easy to install and update free libraries and tools.
            <a href="http://go.microsoft.com/fwlink/?LinkId=245147">Learn more…</a>
        </li>
    </ol>
    <p>
        <span id="privateBlock" >
            <h3 class="auto-style1">Here is content to private:</h3>
            <ol class="round">
                <li class="one">
                    <h5 class="auto-style1">Getting Started</h5>
                    <span class="auto-style1">ASP.NET Web Forms lets you build dynamic websites using a familiar drag-and-drop, event-driven model.
                    A design surface and hundreds of controls and components let you rapidly build sophisticated, powerful UI-driven sites with data access.
                    </span>
                    <a href="http://go.microsoft.com/fwlink/?LinkId=245146" class="auto-style1">Learn more…</a><span class="auto-style1"> </span>
                </li>
                <li class="two">
                    <h5 class="auto-style1">Add NuGet packages and jump-start your coding</h5>
                    <span class="auto-style1">NuGet makes it easy to install and update free libraries and tools.
                    </span>
                    <a href="http://go.microsoft.com/fwlink/?LinkId=245147" class="auto-style1">Learn more…</a><span class="auto-style1"> </span>
                </li>

            </ol>
        </span>
    <p>
        <span id="managerBlock">
            <h3 class="auto-style2">Here is content to manager:</h3>
            <ol class="round">
                <li class="one">
                    <h5 class="auto-style2">Getting Started</h5>
                    <span class="auto-style2">ASP.NET Web Forms lets you build dynamic websites using a familiar drag-and-drop, event-driven model.
                    A design surface and hundreds of controls and components let you rapidly build sophisticated, powerful UI-driven sites with data access.
                    </span>
                    <a href="http://go.microsoft.com/fwlink/?LinkId=245146" class="auto-style2">Learn more…</a><span class="auto-style2"> </span>
                </li>
                <li class="two">
                    <h5 class="auto-style2">Add NuGet packages and jump-start your coding</h5>
                    <span class="auto-style2">NuGet makes it easy to install and update free libraries and tools.
                    </span>
                    <a href="http://go.microsoft.com/fwlink/?LinkId=245147" class="auto-style2">Learn more…</a><span class="auto-style2"> </span>
                </li>
            </ol>

        </span>
    <p>
        &nbsp;</p>
</asp:Content>
<asp:Content ID="Content1" runat="server" contentplaceholderid="HeadContent">
    <style type="text/css">
        .auto-style1 {
            color: #339933;
        }
    .auto-style2 {
        color: #CC3300;
    }
    </style>
</asp:Content>

