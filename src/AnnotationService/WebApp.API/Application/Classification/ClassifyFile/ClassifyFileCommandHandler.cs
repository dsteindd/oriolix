using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NuGet.Packaging;
using WebApp.API.Application.Classification.IntegrationEvents;
using WebApp.API.Data;
using WebApp.API.EventBus;
using WebApp.API.Infrastructure.FileSystem;
using WebApp.API.Models.Classification;

namespace WebApp.API.Application.Classification.ClassifyFile;
