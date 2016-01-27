@echo off
msbuild CAT.ITALite.WebApi\CAT.ITALite.WebApi.csproj /p:DeployOnBuild=true /p:PublishProfile=catitalitewebapi.pubxml /p:Configuration=Debug  /p:VisualStudioVersion=14.0
msbuild CAT.ITALite.Web\CAT.ITALite.Web.csproj /p:DeployOnBuild=true /p:PublishProfile=catitaliteweb.pubxml /p:Configuration=Debug  /p:VisualStudioVersion=14.0
echo deployed to http://catitalitewebapi.chinacloudsites.cn 
echo deployed to http://catitaliteweb.chinacloudsites.cn 