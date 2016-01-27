<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="ClientWebApplication.MyDefault" %>

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
        <span id="privateBlock" ><%=((site_master.CurrentUser == null) ? "<h2 style=\"color:red\">Not authenticated, please login and check it again.</h2>" : privateInfo) %></span>
    <p>
        <span id="managerBlock"><%=((site_master.CurrentUser != null && site_master.CurrentUser.authResult) ? managerInfo : "<h2 style=\"color:red\">Not authorized, please login and check your permission.</h2>") %></span>
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

